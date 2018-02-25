
import React, { Component } from 'react';
import FilterContainer from './FilterContainer';
import Layout from '../dataView/Layout';

export default React.createClass({

    getInitialState: function() {
        return {
            filterNames: [],
            filterValues: [],   // [{'inputName':'value'}]
            iconSize: 50,
        }
    },

    // We store various filter inputs & defaults in STATE
    // but the filter functions are stored here
    filterFunctions: [],

    addFilter: function(filterName) {
        this.setState({
            filterNames: [...this.state.filterNames, filterName],
        });
    },

    handleFilterLoaded: function(filterIndex, filterFunc, defaultValues) {
        this.filterFunctions[filterIndex] = filterFunc;
        let filterValues = [...this.state.filterValues];    // new list
        filterValues[filterIndex] = defaultValues;
        this.setState({
            filterValues: filterValues,
        });
    },

    handleFilterChange: function(filterIndex, paramName, paramValue) {
        let newValues = Object.assign({}, this.state.filterValues[filterIndex]);
        newValues[paramName] = paramValue;
        let filterValues = [...this.state.filterValues];    // new list
        filterValues[filterIndex] = newValues;
        this.setState({
            filterValues: filterValues
        });
    },

    handleRemoveFilter: function(filterIndex) {
        let fNames = [...this.state.filterNames];
        let fValues = [...this.state.filterValues];
        fNames.splice(filterIndex, 1);
        fValues.splice(filterIndex, 1);
        this.setState({
            filterNames: fNames,
            filterValues: fValues
        });
    },

    setIconSize: function(size) {
        this.setState({iconSize: parseInt(size, 10)});
    },

    componentDidMount: function() {
        
    },

    render: function() {

        // Images could be from parent PlateLoader OR DatasetLoader
        let images = this.props.images;
        let filteredImages;

        if (this.state.filterNames) {
            const startTime = performance.now();
            filteredImages = this.state.filterNames.reduce((imgList, name, idx) => {
                // get the filter function...
                let f = this.filterFunctions[idx];
                let paramValues = this.state.filterValues[idx];
                if (f && paramValues) {
                    imgList = imgList.filter(image => f(image, paramValues));
                }
                return imgList;
            }, images);
            console.log("Filtering images took ms:", performance.now() - startTime);
        } else {
            filteredImages = images;
        }
        let imageComponent;

        return(<div className="reactContainer">
                    <FilterContainer
                        datasetId={this.props.datasetId}
                        plateId={this.props.plateId}
                        fieldId={this.props.fieldId}
                        images={this.props.images}
                        addFilter={this.addFilter}
                        handleFilterLoaded={this.handleFilterLoaded}
                        handleFilterChange={this.handleFilterChange}
                        handleRemoveFilter={this.handleRemoveFilter}
                        filterNames={this.state.filterNames}
                        filterValues={this.state.filterValues}
                        />
                    <Layout
                        datasetId={this.props.datasetId}
                        plateId={this.props.plateId}
                        fieldId={this.props.fieldId}
                        setSelectedImages={this.props.setSelectedImages}
                        plateData={this.props.plateData}
                        filteredImages={filteredImages}
                        />
                </div>)
    }
});
