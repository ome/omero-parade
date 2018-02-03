
import React, { Component } from 'react';
import FilterContainer from '../filter/FilterContainer';
import PlateGrid from '../plate/PlateGrid';
import Footer from '../Footer';

export default React.createClass({

    getInitialState: function() {
        return {
            data: undefined,
            selectedWellIds: [],
            filteredImageIds: undefined,
            iconSize: 50,
        }
    },

    setFilteredImageIds: function(imgIds) {
        this.setState({
            filteredImageIds: imgIds
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
                console.log("PlateLoader data", data);
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
        return(<div>
                <div className="plateContainer">
                    <FilterContainer
                    plateId={this.props.plateId}
                    fieldId={this.props.fieldId}
                    plateData={this.state.data}
                    setFilteredImageIds={this.setFilteredImageIds}
                    />
                    <PlateGrid
                    iconSize={this.state.iconSize}
                    plateData={this.state.data}
                    filteredImageIds={this.state.filteredImageIds}
                    />
                
                    <Footer
                        iconSize={this.state.iconSize}
                        setIconSize={this.setIconSize} />
                    </div>
              </div>)
    }
});
