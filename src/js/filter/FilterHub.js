
import React, { Component } from 'react';
import FilterContainer from '../filter/FilterContainer';
import PlateGrid from '../plate/PlateGrid';
import Footer from '../Footer';

export default React.createClass({

    getInitialState: function() {
        return {
            filterNames: [],
            filterValues: [],   // [{'inputName':'value'}]
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

    componentDidMount: function() {
        
    },

    render: function() {
        if (this.props.fieldId === undefined) {
            return(<div></div>)
        }

        let filteredImageIds;

        // Images could be from parent PlateLoader OR DatasetLoader
        let images = this.props.images;

        if (this.state.filterNames) {
            const startTime = performance.now();
            let filteredImages = this.state.filterNames.reduce((imgList, name, idx) => {
                // get the filter function...
                let f = this.filterFunctions[idx];
                let paramValues = this.state.filterValues[idx];
                if (f && paramValues) {
                    imgList = imgList.filter(image => f(image, paramValues));
                }
                return imgList;
            }, images);
            console.log("Filtering images took ms:", performance.now() - startTime);
            filteredImageIds = filteredImages.map(i => i.id);
        }

        return(<div>
                <div className="plateContainer">
                    <FilterContainer
                        plateId={this.props.plateId}
                        fieldId={this.props.fieldId}
                        addFilter={this.addFilter}
                        handleFilterLoaded={this.handleFilterLoaded}
                        handleFilterChange={this.handleFilterChange}
                        filterNames={this.state.filterNames}
                        filterValues={this.state.filterValues}
                        />
                    <PlateGrid
                        iconSize={this.props.iconSize}
                        plateData={this.props.plateData}
                        filteredImageIds={filteredImageIds}
                        />
                
                    <Footer
                        iconSize={this.props.iconSize}
                        setIconSize={this.setIconSize} />
                </div>
              </div>)
    }
});
