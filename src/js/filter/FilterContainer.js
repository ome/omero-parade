import React, { Component } from 'react';


export default React.createClass({

    getInitialState: function() {
        return {filters: []}
    },

    componentDidMount: function() {
        console.log("Fitler mount", this.props.plateId, this.props.fieldId);
        // list available filters (TODO: only for current data? e.g. plate)
        // TODO: probably want to allow 'label' and unique 'id'/'name' for each filter
        $.ajax({
            url: window.PARADE_FILTERS_URL,
            dataType: 'json',
            cache: false,
            success: function(data) {
                console.log("FilterLoader data", data);
                if (this.isMounted()) {
                    this.setState({
                        filters: data.data,
                    });
                }
            }.bind(this)
        });
    },

    handleAddFilter: function(event) {
        var filterName = event.target.value;
        console.log('handleAddFilter', filterName);
        if (filterName !== "--") {
            // Load /filter/?filter=filterName&plate=plateId script
            // which adds itself to the PARADE_FILTERS list,
            // like OPEN_WITH list.

            var url = window.PARADE_INDEX_URL + 'filters/script/' + filterName;
            url += '?plate=' + this.props.plateId;
            url += '&field=' + this.props.fieldId;
            $.getJSON(url, function(data){

                var f = eval(data.f);

                // convert 2D grid to list of images....
                let imgIds = [];
                this.props.plateData.grid.forEach(row => {
                    row.forEach(col => {
                        // returns True if ROI count > 2
                        if (col && f(col, 2)) {
                            imgIds.push(col.id);
                        }
                    });
                });
                console.log('imgIds', imgIds);
                this.props.setFilteredImageIds(imgIds);
            }.bind(this));
        }
    },

    render: function() {
        console.log("render", this.state.filters)
        return(
            <select defaultValue={"--"} onChange={this.handleAddFilter} style={{'float':"left"}}>
                <option
                    value="--" >
                    Add filter...
                </option>
                {this.state.filters.map(function(n, i){
                    return (
                        <option
                            key={i}
                            value={n}>
                            {n}
                        </option>
                    );
                })}
            </select>
        )
    }
});
