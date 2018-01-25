
import React, { Component } from 'react';
import FilterContainer from '../filter/FilterContainer';
import PlateGrid from '../plate/PlateGrid';

export default React.createClass({

    getInitialState: function() {
        return {
            data: undefined,
            selectedWellIds: [],
            filteredImageIds: []
        }
    },

    setFilteredImageIds: function(imgIds) {
        this.setState({
            filteredImageIds: imgIds
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
                <FilterContainer
                 plateId={this.props.plateId}
                 fieldId={this.props.fieldId}
                 plateData={this.state.data}
                 setFilteredImageIds={this.setFilteredImageIds}
                />
                <PlateGrid
                 plateData={this.state.data}
                 filteredImageIds={this.state.filteredImageIds}
                />
              </div>)
    }
});
