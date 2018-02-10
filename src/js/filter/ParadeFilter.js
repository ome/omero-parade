import React, { Component } from 'react';
import FilterInput from './FilterInput';


export default React.createClass({

    getInitialState: function() {
        return {
            filterParams: [],
        }
    },

    componentDidMount: function() {
        // Load /filter/?filter=filterName&plate=plateId script
        // which adds itself to the PARADE_FILTERS list,
        // like OPEN_WITH list.

        var url = window.PARADE_INDEX_URL + 'filters/script/' + this.props.name;
        if (this.props.datasetId) url += '?dataset=' + this.props.datasetId;
        if (this.props.plateId) url += '?plate=' + this.props.plateId;
        if (this.props.fieldId !== undefined) url += '&field=' + this.props.fieldId;
        $.getJSON(url, function(data){
            // Response has filter function - Needs eval()
            var f = eval(data.f);
            // Get current values - set state to parent
            var filterValues = data.params.reduce((prev, current) => {
                prev[current.name] = current.default;
                return prev;
            }, {});
            this.props.handleFilterLoaded(this.props.filterIndex, f, filterValues);

            this.setState({
                filterParams: data.params
            })
        }.bind(this));
    },
    
    handleFilterInput: function(paramName, value) {
        this.props.handleFilterChange(this.props.filterIndex, paramName, value);
    },

    render: function() {
        return(
            <div>{this.props.name}
                {this.state.filterParams.map(p => {
                    return <FilterInput
                                param={p}
                                key={p.name}
                                onChange={this.handleFilterInput}
                            />
                })}
            </div>
        )
    }
});
