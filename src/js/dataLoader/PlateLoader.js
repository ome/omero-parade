
import React, { Component } from 'react';
import FilterContainer from '../filter/FilterContainer';
import PlateGrid from '../plate/PlateGrid';
import Footer from '../Footer';

export default React.createClass({

    getInitialState: function() {
        return {
            data: undefined,
            selectedWellIds: [],
            iconSize: 50,
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

    setIconSize: function(size) {
        this.setState({
            iconSize: size
        });
    },

    componentDidMount: function() {
        var plateId = this.props.plateId,
            fieldId = this.props.fieldId;

        if (fieldId === undefined) return;

        var url = "/webgateway/plate/" + plateId + "/" + fieldId + "/";
        $.ajax({
            url: url,
            dataType: 'json',
            cache: false,
            success: function(data) {
                if (this.isMounted()) {
                    this.setState({
                        data: data,
                    });
                }
            }.bind(this),
                error: function(xhr, status, err) {
            }.bind(this)
        });
    },

    render: function() {
        if (this.props.fieldId === undefined) {
            return(<div></div>)
        }

        let filteredImageIds;

        // Use filter state to filter data.
        // Pass filteredImageIds down to PlateGrid
        let images = [];
        if (this.state.data) {
            this.state.data.grid.forEach(row => {
                row.forEach(col => {
                    // TODO: 
                    if (col) images.push(col);
                });
            });
        }

        if (this.state.filterNames) {
            let filteredImages = this.state.filterNames.reduce((imgList, name, idx) => {
                // get the filter function...
                let f = this.filterFunctions[idx];
                let paramValues = this.state.filterValues[idx];
                if (f && paramValues) {
                    imgList = imgList.filter(image => f(image, paramValues));
                }
                return imgList;
            }, images);

            filteredImageIds = filteredImages.map(i => i.id);
        }

        return(<div>
                <div className="plateContainer">
                    <FilterContainer
                        plateId={this.props.plateId}
                        fieldId={this.props.fieldId}
                        plateData={this.state.data}
                        addFilter={this.addFilter}
                        handleFilterLoaded={this.handleFilterLoaded}
                        handleFilterChange={this.handleFilterChange}
                        filterNames={this.state.filterNames}
                        filterValues={this.state.filterValues}
                        />
                    <PlateGrid
                        iconSize={this.state.iconSize}
                        plateData={this.state.data}
                        filteredImageIds={filteredImageIds}
                        />
                
                    <Footer
                        iconSize={this.state.iconSize}
                        setIconSize={this.setIconSize} />
                </div>
              </div>)
    }
});
