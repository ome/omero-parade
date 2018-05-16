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
            filter: 'img',
            distance: 2,
            stop: () => {
                // Make the same selection in the jstree etc
                let ids = [];
                $(".thumbnail_plot_canvas .ui-selected").each(function(){
                    ids.push(parseInt($(this).attr(idAttr), 10));
                });
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

    getAxisTicks(dataRanges, name, numberOfTicks) {
        let minMax = dataRanges[name];
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

            let left_position = this.getAxisPercent(dataRanges, xAxisName, x);
            let top_position = (100 - this.getAxisPercent(dataRanges, yAxisName, y));

            return (
                <img alt="image"
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
                />
            )
        });
        return (
            <div className="parade_centrePanel">
                <div className="axis-x-label"  style={{transform: "translateY(435px)", textAlign: "center"}}>
                    <select onChange={(event) => {this.setAxisName('x', event, yAxisName)}}
                            value={xAxisName}
                            style={styles.xAxisSelect}>
                        {axisNames.map((n, i) => (<option key={i} value={n}> {n}</option>))}
                    </select>
                </div>
                <div className="axis y"
                     style={{
                        transformOrigin: "center",
                        transform: "translate(-50%, 0) rotate(-90deg) translate(-210px,25px)",
                        textAlign: "center"
                    }}>
                    <select onChange={(event) => {this.setAxisName('y', event, xAxisName)}}
                            value={yAxisName}
                            style={styles.yAxisSelect}>
                        {axisNames.map((n, i) => (<option key={i} value={n}> {n}</option>))}
                    </select>
                </div>
                <div className="thumbnail_plot">
                    <div className="thumbnail_plot_canvas" ref="thumb_plot_canvas">
                        {images}
                    </div>
                </div>
            </div>
        );
    }
}

export default DataPlot
