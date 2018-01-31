import React, { Component } from 'react';
import FilterInput from './FilterInput';


export default React.createClass({

    getInitialState: function() {
        return {
            filterFunc: undefined,
            filterParams: [],
            paramValues: [],
        }
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
            this.setState({
                filterFunc: f,
                filterParams: data.params,
            })
        }.bind(this));
    },
    
    handleFilterInput: function(event, paramIndex) {
        console.log("Handle Filter input", event.target.value, paramIndex);

        // If we have all the parameters we need, do the filtering...
        let limit = parseInt(event.target.value);
        // convert 2D grid to list of images....
        let imgIds = [];
        this.props.plateData.grid.forEach(row => {
            row.forEach(col => {
                // returns True if ROI count > 2
                if (col && this.state.filterFunc(col, limit)) {
                    imgIds.push(col.id);
                }
            });
        });
        console.log('imgIds', imgIds);
        this.props.updateFiltering(this.props.index, imgIds);
    },

    render: function() {
        console.log("render filter...", this.props.name)
        return(
            <div>Filter: {this.props.name}
                {this.state.filterParams.map((p, i) => {
                    return <FilterInput
                                type={p.type}
                                key={i}
                                paramIndex={i}
                                onChange={this.handleFilterInput}
                            />
                })}
            </div>
        )
    }
});
