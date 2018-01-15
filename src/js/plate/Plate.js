
import React, { Component } from 'react';
import PlateGrid from './PlateGrid'
import Footer from '../Footer'


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

        // Load OMERO.tables data for this plate (if any)
        url = "/webgateway/table/Plate/" + plateId + "/query/?query=*";
        $.ajax({
            url: url,
            dataType: 'json',
            cache: false,
            success: function(data) {
                if (this.isMounted()) {
                    console.log("table", data);
                    // if we have table data for this plate...
                    if (data.data && data.data.columns) {
                        // TODO: find which column is the Well ID
                        var wellColIdx = 0;
                        // want to get data in map of {wellId:[values]}
                        var heatmapData = data.data.rows.reduce(function(prev, curr){
                            var wellId = curr[wellColIdx] + "";
                            prev[wellId] = curr;
                            return prev;
                        }, {});

                        this.setState({
                            heatmapNames: data.data.columns,
                            heatmapData: heatmapData,
                        });
                    }
                }
            }.bind(this)
        });
    },

    getInitialState: function() {
        return {
            fields: [],
            selectedField: undefined,
            heatmapNames: undefined,
            heatmapData: undefined,
            selectedHeatmap: undefined,
            heatmapRange: undefined,
        }
    },

    handleFieldSelect: function(event) {
        this.setState({selectedField: event.target.value});
    },

    handleHeatmapSelect: function(event) {
        var heatmapIndex = event.target.value;

        // Need to calculate colours for all wells (if data is numeric)
        // Get range of values
        var values = [];
        for (var wellId in this.state.heatmapData) {
            values.push(this.state.heatmapData[wellId]);
        }
        var maxValue = values.reduce(function(prev, well){
            var value = well[heatmapIndex];
            return Math.max(prev, value);
        }, 0);
        var minValue = values.reduce(function(prev, well){
            var value = well[heatmapIndex];
            return Math.min(prev, value);
        }, maxValue);

        // Wells will calculate their own color, but they need
        // to know the range of heatmap values in the plate
        var heatmapRange;
        if (!isNaN(minValue) && !isNaN(maxValue)) {
            heatmapRange = [minValue, maxValue];
        }
        this.setState({
            selectedHeatmap: heatmapIndex,
            heatmapRange: heatmapRange,
        });
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

        var heatmapChooser;
        var options;
        if (this.state.heatmapNames) {
            heatmapChooser = (
                <select onChange={this.handleHeatmapSelect}>
                    {this.state.heatmapNames.map(function(n, i){
                        return (
                            <option
                                key={i}
                                value={i}>
                                {n}
                            </option>
                        );
                    })}
                </select>
            );
        }
        // #spw id is just for css
        // Use key: selectedField to force PlateGrid to mount on field change
        return (
            <div>
                <div className="plateContainer">
                    <div>
                        <select onChange={this.handleFieldSelect} >
                            {fieldSelect}
                        </select>
                        {heatmapChooser}
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
