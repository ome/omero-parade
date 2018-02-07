
import React, { Component } from 'react';
import FilterHub from '../filter/FilterHub';
import PlateGrid from '../plate/PlateGrid';
import Footer from '../Footer';

export default React.createClass({

    getInitialState: function() {
        return {
            data: undefined,
            selectedWellIds: [],
            iconSize: 50,
        }
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

        return(<FilterHub
                    images={images}
                    plateId={this.props.plateId}
                    fieldId={this.props.fieldId}
                    plateData={this.state.data}
                    iconSize={this.state.iconSize}
                    setIconSize={this.setIconSize}
                />)
    }
});
