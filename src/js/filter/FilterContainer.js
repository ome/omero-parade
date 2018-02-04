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
        // list available filters (TODO: only for current data? e.g. plate)
        $.ajax({
            url: window.PARADE_FILTERS_URL,
            dataType: 'json',
            cache: false,
            success: function(data) {
                if (this.isMounted()) {
                    this.setState({
                        filters: data.data,
                    });
                }
            }.bind(this)
        });
    },

    handleAddFilter: function(event) {
        // When user chooses to ADD a filter by Name, setState of parent
        var filterName = event.target.value;
        if (filterName !== "--") {
            this.props.addFilter(filterName);
        }
    },

    render: function() {
        return(
            <div className="filterContainer">
                <select defaultValue={"--"} onChange={this.handleAddFilter}>
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
                    this.props.filterNames.map((fname, idx) => (
                        <ParadeFilter
                            key={""+idx}
                            filterIndex={idx}
                            name={fname}
                            plateId={this.props.plateId}
                            fieldId={this.props.fieldId}
                            handleFilterLoaded={this.props.handleFilterLoaded}
                            handleFilterChange={this.props.handleFilterChange}
                        />
                    ))
                }
            </div>
        )
    }
});
