import React, { Component } from 'react';
import PlateLoader from './PlateLoader';

const Plate = React.createClass({

    componentDidMount: function() {
        var parentNode = this.props.parentNode,
            plateId = this.props.plateId,
            objId = parentNode.data.id;
        var data;
        if (parentNode.type === "acquisition") {
            // select 'run', load plate...
            data = {'run': objId};
        } else if (parentNode.type == "plate") {
            // select 'plate', load if single 'run'
            if (parentNode.children.length < 2) {
                data = {'plate': objId};
            }
        } else {
            return;
        }

        var url = "/omero_parade/api/fields/";
        $.ajax({
            url: url,
            data: data,
            dataType: 'json',
            cache: false,
            success: function(data) {
                console.log('fields', data);
                if (this.isMounted()) {
                    this.setState({
                        fields: data.data,
                        selectedField: data.data[0]
                    });
                }
            }.bind(this),
                error: function(xhr, status, err) {
            }.bind(this)
        });
    },

    getInitialState: function() {
        return {
            fields: [],
            selectedField: undefined,
        }
    },

    render: function() {
        return (
            <PlateLoader
                key={this.state.selectedField}
                plateId={this.props.plateId}
                fieldId={this.state.selectedField} />
        )
    }
});

export default Plate
