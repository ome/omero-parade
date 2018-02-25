import React, { Component } from 'react';
import ParadeFilter from './ParadeFilter';


export default React.createClass({

    getInitialState: function() {
        return {
            filters: [],
        }
    },

    componentDidMount: function() {
        // list available filters (TODO: only for current data? e.g. plate)
        let url = window.PARADE_FILTERS_URL;
        if (this.props.plateId) {
            url += '?plate=' + this.props.plateId;
        }
        else if (this.props.datasetId) {
            url += '?dataset=' + this.props.plateId;
        } else {
            url += '?' + this.props.images.map(i => 'image=' + i.id).join('&');
        }
        $.ajax({
            url: url,
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
                <select value={"--"} onChange={this.handleAddFilter}>
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
                            key={fname + idx}
                            filterIndex={idx}
                            name={fname}
                            datasetId={this.props.datasetId}
                            plateId={this.props.plateId}
                            fieldId={this.props.fieldId}
                            images={this.props.images}
                            handleFilterLoaded={this.props.handleFilterLoaded}
                            handleFilterChange={this.props.handleFilterChange}
                            handleRemoveFilter={this.props.handleRemoveFilter}
                        />
                    ))
                }
            </div>
        )
    }
});
