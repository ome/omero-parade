
import React, { Component } from 'react';
import FilterContainer from '../filter/FilterContainer';

export default React.createClass({

    getInitialState: function() {
        return {
            data: undefined,
            selectedWellIds: [],
        }
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
        return(<FilterContainer
                 plateId={this.props.plateId}
                 fieldId={this.props.fieldId}
                />)
    }
});
