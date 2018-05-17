//
// Copyright (C) 2018 University of Dundee & Open Microscopy Environment.
// All rights reserved.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.
//

import React, { Component } from 'react';
import { getHeatmapColor } from '../../util';
import config from '../../config';

const styles = {
    xAxisSelect: {
    },
    yAxisSelect: {

    },
}
class DataPlot extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            xAxisName: undefined,
            yAxisName: undefined,
        }
        this.setAxisName = this.setAxisName.bind(this);
    }

    setAxisName(axis, event, otherAxis) {
        // Set BOTH axis names.
        // Since we start with both undefined, as soon as
        // user picks one to change, we set both.
        let name = event.target.value;
        if (axis === 'x') {
            this.setState({xAxisName: name, yAxisName: otherAxis});
        } else {
            this.setState({yAxisName: name, xAxisName: otherAxis});
        }
    }

    componentDidMount() {
        let dtype = this.props.imgJson[0].wellId ? 'well' : 'image';
        let idAttr = (dtype === 'well' ? 'data-wellid': 'data-id')
        $(this.refs.thumb_plot_canvas).selectable({
            filter: 'div',
            distance: 2,
            stop: () => {
                // Make the same selection in the jstree etc
                console.log("Selecting things");
                let ids = [];
                $(".thumbnail_plot_canvas .ui-selected").each(function(){
                    ids.push(parseInt($(this).attr(idAttr), 10));
                });
                console.log("Selected ids", dtype, ids);
                this.props.setImagesWellsSelected(dtype, ids);
            },
        });
    }

    componentWillUnmount() {
        // cleanup plugin
        $(this.refs.dataIcons).selectable( "destroy" );
    }

    getAxisPercent(dataRanges, name, value) {
        if (!value) {
            return 0;
        }
        let minMax = dataRanges[name];
        let fraction = (value - (minMax[0]))/((minMax[1]) - (minMax[0]));
        return fraction * 100;
    }

    getAxisTicks(dataRanges, name, axisScales) {
        let minMax = dataRanges[name];
        let tickValues = axisScales.map( (scale, index) => {
            return (minMax[0] + ((minMax[1] - minMax[0]) * scale / 100.0)).toFixed(2);
        });
        return tickValues;
        let step = (minMax[1] - minMax[0]) / (numberOfTicks - 1);
        let ticks = Array.from(
            {length: numberOfTicks},
            (x, i) => (minMax[0] + i * step).toFixed(2));
        return ticks;
    }

    render() {
        let {imgJson, iconSize, tableData,
             handleImageWellClicked, selectedWellIds} = this.props;

        let xAxisName = this.state.xAxisName;
        let yAxisName = this.state.yAxisName;

        // Available axes are dataTable keys.
        let axisNames = Object.keys(tableData);
        if (axisNames.length < 2) {
            return (<div>Choose more data to load</div>)
        }

        if (xAxisName !== undefined) {
            axisNames.splice(axisNames.indexOf(xAxisName), 1);
        }
        if (yAxisName !== undefined) {
            axisNames.splice(axisNames.indexOf(yAxisName), 1);
        }
        if (xAxisName == undefined) {
            xAxisName = axisNames[0];
            axisNames.splice(0, 1);
        }
        if (yAxisName == undefined) {
            yAxisName = axisNames[0];
        }
        axisNames = Object.keys(tableData);
        let dataRanges = axisNames.reduce((prev, name) => {
            let v = tableData[name];
            prev[name] = [v.min, v.max];
            return prev;
        }, {});

        const images = imgJson.map(image => {
            const classNames = [];
            let src = this.props.thumbnails[image.id];
            if (!src) {
                classNames.push("waiting");
                src = config.staticPrefix + "webgateway/img/spacer.gif";
            }
            if (image.selected || selectedWellIds.includes(image.wellId)) {
                classNames.push("ui-selected");
            }
            const x = tableData[xAxisName].data[image.id];
            const y = tableData[yAxisName].data[image.id];

            let properties = "";
            for (let key in tableData) {
                if (key != xAxisName && key != yAxisName) {
                    properties += "\n" + key + ": " + tableData[key].data[image.id];
                }
            }

            let left_position = this.getAxisPercent(dataRanges, xAxisName, x);
            let top_position = (100 - this.getAxisPercent(dataRanges, yAxisName, y));
            classNames.push("data-point");
            return (
                <div
                    style={{
                        position: "absolute",
                        left: left_position + '%',
                        top: top_position + '%'}}
                    key={image.id + (image.parent ? image.parent : "")}
                    className={classNames.join(" ")}
                    data-id={image.id}
                    data-wellid={image.wellId}
                    title={
                        "Image Name: " + image.name +
                        "\n" + xAxisName + ": " + x +
                        "\n" + yAxisName + ": " + y +
                        properties}
                    onClick={event => {handleImageWellClicked(image, event)}}
                ></div>
                /*
                <circle
                    cx={left_position + '%'}
                    cy={top_position + '%'}
                    r="5"
                    stroke="#33aba1"
                    strokeWidth="1"
                    fill="#1f4579"
                    key={image.id + (image.parent ? image.parent : "")}
                    className={classNames.join(" ")}
                    data-id={image.id}
                    data-wellid={image.wellId}
                    title={image.name}
                    onClick={event => {handleImageWellClicked(image, event)}}
                />
                */
                /*<img alt="image"
                    key={image.id + (image.parent ? image.parent : "")}
                    className={classNames.join(" ")}
                    data-id={image.id}
                    data-wellid={image.wellId}
                    src={src}
                    title={image.name}
                    onClick={event => {handleImageWellClicked(image, event)}}
                    style={{
                        left: left_position + '%',
                        top: top_position + '%'
                    }}
                />*/
            )
        });
        const lineStyle = {
            stroke: 'black',
            strokeWidth: 1
        }
        const plotHeight = 450;
        const xAxisLabelScale = [0, 25, 50, 75, 100];
        const xAxisLabelValues = this.getAxisTicks(
            dataRanges, xAxisName, xAxisLabelScale);
        const xAxisTicks = xAxisLabelScale.map( (label, index) => {
            let transform = ""
            if (label == 0) {
                transform = "translateX(1px)";
            } else {
                transform = "translateX(0px)";
            }
            if (label == 0 || label == 100) {
                return (
                    <g>
                        <line style={{
                                stroke: "black", strokeWidth: 1,
                                shapeRendering: "crispEdges",
                                transform: transform}}
                              x1={label + "%"}
                              x2={label + "%"}
                              y2="10">
                        </line>
                        <text x={label + "%"} y="25" style={{transform: "translateX(-10px)"}}>
                            {xAxisLabelValues[index]}
                        </text>
                    </g>
                )
            } else {
                return (
                    <g>
                        <line style={{
                                stroke: "black", strokeWidth: 1,
                                shapeRendering: "crispEdges",
                                transform: transform}}
                              x1={label + "%"}
                              x2={label + "%"}
                              y2="10">
                            </line>
                        <line style={{
                                stroke: "gray", strokeWidth: 1,
                                strokeDasharray: "5,5", shapeRendering: "crispEdges",
                                transform: transform}}
                              x1={label + "%"} x2={label + "%"} y2={-plotHeight}></line>
                        <text x={label + "%"} y="25" style={{transform: "translateX(-10px)"}}>
                            {xAxisLabelValues[index]}
                        </text>
                    </g>
                )
            }
        });
        const yAxisLabelScale = [0, 33, 66, 100];
        const yAxisLabelValues = this.getAxisTicks(
            dataRanges, yAxisName, yAxisLabelScale);
        {/* taken from css */}
        const yAxisTicks = yAxisLabelScale.map( (label, index) => {
            if (label == 0 || label == 100) {
                return (
                    <g>
                        <line style={{
                                stroke: "black", strokeWidth: 1,
                                shapeRendering: "crispEdges"}}
                              y1={(100 - label) * plotHeight / 100}
                              y2={(100 - label) * plotHeight / 100}
                              x2="-10">
                        </line>
                        <text y={((100 - label) * plotHeight / 100) - 5} x="-45">
                            {yAxisLabelValues[index]}
                        </text>
                    </g>
                )
            } else {
                return (
                    <g>
                        <line style={{
                                stroke: "black", strokeWidth: 1,
                                shapeRendering: "crispEdges"}}
                              y1={(100 - label) * plotHeight / 100}
                              y2={(100 - label) * plotHeight / 100}
                              x2="-10">
                        </line>
                        <line style={{
                                stroke: "gray", strokeWidth: 1,
                                strokeDasharray: "5,5", shapeRendering: "crispEdges"}}
                              y1={(100 - label) * plotHeight / 100}
                              y2={(100 - label) * plotHeight / 100}
                              x2="100%">
                        </line>
                        <text y={((100 - label) * plotHeight / 100) - 5} x="-45">
                            {yAxisLabelValues[index]}
                        </text>
                    </g>
                )
            }
        });
        return (
            <div className="parade_centrePanel">
                {/* The Plot */}
                {/*}
                <div className="thumbnail_plot">
                    <div className="thumbnail_plot_canvas1" ref="thumb_plot_canvas1">
                        <svg className="thumbnail_plot_canvas" ref="thumb_plot_canvas" style={{width: "100%", height: plotHeight - 20 + "px", overflow: "inherit"}}>
                            {images}
                        </svg>
                    </div>
                </div>
                */}
                <div className="thumbnail_plot">
                    <div className="thumbnail_plot_canvas" ref="thumb_plot_canvas" style={{zIndex: 1000}}>
                        {images}
                    </div>
                </div>
                {/* X Axis Ticks */}
                <div className="xTicks" style={{zindex: -1, height: "40px", marginLeft: '75px', marginRight: '75px'}}>
                    <svg style={{width: "100%", resize: "both", fontSize: "10px", overflow: "inherit"}}>
                        {xAxisTicks}
                    </svg>
                </div>
                {/* X Axis Label */}
                <div className="axis-x-label"  style={{zIndex: -1, textAlign: "center"}}>
                    <select onChange={(event) => {this.setAxisName('x', event, yAxisName)}}
                            value={xAxisName}
                            style={styles.xAxisSelect}>
                        {axisNames.map((n, i) => (<option key={i} value={n}> {n}</option>))}
                    </select>
                </div>
                {/* Y AXis Ticks */}
                <div className="yTicks" style={{zIndex: -1, marginLeft: '75px', marginRight: '75px', transform: "translateY(-509px)"}}>
                    <svg style={{width: "100%", resize: "both", fontSize: "10px", overflow: "inherit"}}>
                        {yAxisTicks}
                    </svg>
                </div>
                {/* Y Axis Label */}
                <div className="axis y"
                     style={{
                        zIndex: -1,
                        transformOrigin: "center",
                        transform: "translate(-50%, 0) rotate(-90deg) translate(450px, 15px)",
                        textAlign: "center"
                    }}>
                    <select onChange={(event) => {this.setAxisName('y', event, xAxisName)}}
                            value={yAxisName}
                            style={styles.yAxisSelect}>
                        {axisNames.map((n, i) => (<option key={i} value={n}> {n}</option>))}
                    </select>
                </div>
            </div>
        );
    }
}

export default DataPlot
