
import React, { Component } from 'react';
import PlateGrid from './PlateGrid'
import Footer from '../Footer'
import HeatmapChooser from './HeatmapChooser';


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
            heatmapData: undefined,
            selectedHeatmap: undefined,
            heatmapRange: undefined,
        }
    },

    // allow child HeatmapChooser to set heatmap data for Plate
    setHeatmap: function(data) {
        this.setState(data);
    },

    handleFieldSelect: function(event) {
        this.setState({selectedField: event.target.value});
    },

    render: function() {
        var fieldSelect,
            fields = this.state.fields;
        if (fields.length === 0) {
            return (<div className="iconTable">Loading...</div>);
        }
        fieldSelect = [];
        for (var f=fields[0], idx=1; f<=fields[1]; f++) {
            fieldSelect.push(
                <option
                    key={f}
                    value={f}>
                    {"Field " + idx}
                </option>);
            idx++;
        }

        // #spw id is just for css
        // Use key: selectedField to force PlateGrid to mount on field change
        return (
            <div>
                <div className="plateContainer">
                    <div>
                        <select
                            style={{'float':"left"}}
                            onChange={this.handleFieldSelect} >
                            {fieldSelect}
                        </select>
                        <HeatmapChooser
                            plateId={this.props.plateId}
                            heatmapData={this.state.heatmapData}
                            heatmapRange={this.state.heatmapRange}
                            setHeatmap={this.setHeatmap} />
                    </div>
                    <div id="spw">
                        <PlateGrid
                            key={this.state.selectedField}
                            iconSize={this.props.iconSize}
                            plateId={this.props.plateId}
                            selectedHeatmap={this.state.selectedHeatmap}
                            heatmapRange={this.state.heatmapRange}
                            heatmapData={this.state.heatmapData}
                            fieldId={this.state.selectedField} />
                    </div>
                </div>
                <Footer
                    iconSize={this.props.iconSize}
                    setIconSize={this.props.setIconSize} />
            </div>
        )
    }
});

export default Plate
