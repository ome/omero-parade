import React, { Component } from 'react';


export default React.createClass({

    getInitialState: function() {
        return {filters: []}
    },

    componentDidMount: function() {
        console.log("Fitler mount", this.props.plateId, this.props.fieldId);
        // list available filters (TODO: only for current data? e.g. plate)
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

        if (filterName !== "--") {
            // Load /filter/?filter=filterName&plate=plateId script
            // which adds itself to the PARADE_FILTERS list,
            // like OPEN_WITH list.
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
