
import React, { Component } from 'react';
import ImageIcon from '../dataset/ImageIcon';
import { getHeatmapColor } from '../util';

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
export default React.createClass({

    getInitialState: function() {
        return {
            xAxisName: undefined,
            yAxisName: undefined,
        }
    },

    setAxisName: function(axis, event, otherAxis) {
        // Set BOTH axis names.
        // Since we start with both undefined, as soon as
        // user picks one to change, we set both.
        let name = event.target.value;
        if (axis === 'x') {
            this.setState({xAxisName: name, yAxisName: otherAxis});
        } else {
            this.setState({yAxisName: name, xAxisName: otherAxis});
        }
    },

    componentDidMount: function() {
        let dtype = this.props.imgJson[0].wellId ? 'well' : 'image';
        let idAttr = (dtype === 'well' ? 'data-wellId': 'data-id')
        $(this.refs.thumb_plot_canvas).selectable({
            filter: 'img',
            distance: 2,
            stop: () => {
                // Make the same selection in the jstree etc
                let ids = [];
                $(".thumbnail_plot_canvas .ui-selected").each(function(){
                    ids.push(parseInt($(this).attr(idAttr), 10));
                });
                console.log('dype', dtype, ids);
                this.props.setImagesWellsSelected(dtype, ids);
            },
        });
    },

    componentWillUnmount: function() {
        // cleanup plugin
        $(this.refs.dataIcons).selectable( "destroy" );
    },

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

        console.log('DataPlot', imgJson)

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
                                className={(image.selected || selectedWellIds.indexOf(image.id)) > -1 ? 'ui-selected' : ''}
                                key={image.id}
                                data-id={image.id}
                                data-wellId={image.wellId}
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
});
