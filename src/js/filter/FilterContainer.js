import React, { Component } from 'react';
import ParadeFilter from './ParadeFilter';


export default React.createClass({

    getInitialState: function() {
        return {
            filters: [],
            selectedFilters: [],
        }
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
        console.log('handleAddFilter', filterName, [...this.state.selectedFilters, filterName]);
        if (filterName !== "--") {
            this.setState({
                selectedFilters: [...this.state.selectedFilters, filterName]
            });
        }
    },

    render: function() {
        console.log("render this.state.filters:", this.state.filters)
        return(
            <div>
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
                <br />
                {
                    this.state.selectedFilters.map(fname => (
                        <ParadeFilter
                            key={fname}
                            name={fname}
                            plateId={this.props.plateId}
                            fieldId={this.props.fieldId}
                            plateData={this.props.plateData}
                            setFilteredImageIds={this.props.setFilteredImageIds}
                        />
                    ))
                }
            </div>
        )
    }
});
