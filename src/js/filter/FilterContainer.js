import React, { Component } from 'react';
import ParadeFilter from './ParadeFilter';


export default React.createClass({

    getInitialState: function() {
        return {
            filters: [],
            selectedFilters: [],
        }
    },

    // 2D list. Each filter adds a list of image IDs filtered
    filteredImageIds: [],

    updateFiltering: function(filterIndex, imageIds) {

        // After each filter changes we update state, calculate the combination of
        // all filters and pass this up to parent component...

        this.filteredImageIds[filterIndex] = imageIds;
        console.log("this.filteredImageIds", this.filteredImageIds);
        let filteredIds = this.filteredImageIds.reduce(function(prev, curr){
            console.log('prev', prev, 'curr', curr);
            if (prev && curr) {
                // remove any ids from prev that aren't in curr
                prev = prev.filter(p => curr.indexOf(p) > -1);
            }
            return prev;
        })
        console.log('fileredIds', filteredIds);
        this.props.setFilteredImageIds(filteredIds);
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
                    this.state.selectedFilters.map((fname, idx) => (
                        <ParadeFilter
                            key={""+idx}
                            index={idx}
                            name={fname}
                            plateId={this.props.plateId}
                            fieldId={this.props.fieldId}
                            plateData={this.props.plateData}
                            updateFiltering={this.updateFiltering}
                        />
                    ))
                }
            </div>
        )
    }
});
