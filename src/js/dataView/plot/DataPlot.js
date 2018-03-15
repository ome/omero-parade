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

const styles = {
    xAxisSelect: {
        position: 'absolute',
        right: '40%',
        top: '100%',
    },
    yAxisSelect: {
        position: 'absolute',
        right: '100%',
        top: '50%',
        transform: 'rotate(-90deg)',
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
            let mn = Object.values(tableData[name]).reduce((p, v) => Math.min(p, v));
            let mx = Object.values(tableData[name]).reduce((p, v) => Math.max(p, v));
            prev[name] = [mn, mx]
            return prev;
        }, {});
        function getAxisPercent(name, value) {
            if (!value) return 0;
            let minMax = dataRanges[name];
            let fraction = (value - minMax[0])/(minMax[1] - minMax[0]);
            return fraction * 100;
        }

        return (
            <div className="parade_centrePanel">
                <div className="thumbnail_plot">
                    <select onChange={(event) => {this.setAxisName('y', event, xAxisName)}}
                            value={yAxisName}
                            style={styles.yAxisSelect}>
                        {axisNames.map((n, i) => (<option key={i} value={n}> {n}</option>))}
                    </select>
                    <select onChange={(event) => {this.setAxisName('x', event, yAxisName)}}
                            value={xAxisName}
                            style={styles.xAxisSelect}>
                        {axisNames.map((n, i) => (<option key={i} value={n}> {n}</option>))}
                    </select>

                    <div className="thumbnail_plot_canvas" ref="thumb_plot_canvas">
                        {imgJson.map(image => (
                            <img alt="image"
                                key={image.id + (image.parent ? image.parent : "")}
                                className={(image.selected || selectedWellIds.indexOf(image.wellId)) > -1 ? 'ui-selected' : ''}
                                data-id={image.id}
                                data-wellid={image.wellId}
                                src={"/webgateway/render_thumbnail/" + image.id + "/"}
                                title={image.name}
                                onClick={event => {handleImageWellClicked(image, event)}}
                                style={{left: getAxisPercent(xAxisName, tableData[xAxisName][image.id]) + '%',
                                        top: (100 - getAxisPercent(yAxisName, tableData[yAxisName][image.id])) + '%'}}
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    }
}

export default DataPlot
