import React, { Component } from 'react';


export default React.createClass({

    getInitialState: function() {
        return {}
    },

    componentDidMount: function() {
        console.log("ParadeFitler mount", this.props.plateId, this.props.fieldId);
        // Load /filter/?filter=filterName&plate=plateId script
        // which adds itself to the PARADE_FILTERS list,
        // like OPEN_WITH list.

        var url = window.PARADE_INDEX_URL + 'filters/script/' + this.props.name;
        url += '?plate=' + this.props.plateId;
        url += '&field=' + this.props.fieldId;
        $.getJSON(url, function(data){

            // Response has filter function - Needs eval()
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
    },

    handleAddFilter: function(event) {
        var filterName = event.target.value;
        console.log('handleAddFilter', filterName);
        if (filterName !== "--") {

            this.setState([...this.state.filters, filterName]);
            
            // Load /filter/?filter=filterName&plate=plateId script
            // which adds itself to the PARADE_FILTERS list,
            // like OPEN_WITH list.

            var url = window.PARADE_INDEX_URL + 'filters/script/' + filterName;
            url += '?plate=' + this.props.plateId;
            url += '&field=' + this.props.fieldId;
            $.getJSON(url, function(data){

                // Response has filter function - Needs eval()
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
        console.log("render filter...", this.props.name)
        return(
            <div>Filter: {this.props.name}</div>
        )
    }
});
