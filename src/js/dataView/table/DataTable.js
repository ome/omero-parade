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
import clusterfck from 'clusterfck';

class DataTable extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            showHeatmapColumns: {},
            sortBy: undefined,
        }
        this.handleSortTable = this.handleSortTable.bind(this);
        this.handleShowHeatmap = this.handleShowHeatmap.bind(this);
        this.clusterTableData = this.clusterTableData.bind(this);
        this.traverseCluster = this.traverseCluster.bind(this);
    }

    componentDidMount() {
        $(this.refs.dataTable).selectable({
            filter: 'img',
            distance: 2,
            stop: () => {
                let dtype = this.props.imgJson[0].wellId ? 'well' : 'image';
                let idAttr = (dtype === 'well' ? 'data-wellid': 'data-id');
                // Make the same selection in the jstree etc
                let ids = [];
                $(".parade_dataTable .ui-selected").each(function(){
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

    handleSortTable(event, name) {
        event.preventDefault();
        this.setState({
            sortBy: name
        });
    }

    handleShowHeatmap(event, name) {
        let checked = event.target.checked;
        let showHeatmapColumns = Object.assign({}, this.state.showHeatmapColumns);
        showHeatmapColumns[name] = checked;
        this.setState({
            showHeatmapColumns: showHeatmapColumns
        });
    }

    clusterTableData() {
        // make a list of data for each image from state.tableData
        // Each item of tableData is already a dict of {imageId: value}
        let dataKeys = Object.keys(this.props.tableData);
        if (dataKeys.length < 2) return;
        // make dict of {imageId: [v1, v2, v3]}.
        let imageIds = this.props.imgJson.map(i => i.id);
        let toCluster = imageIds.map(iid => {
            return dataKeys.map(key => this.props.tableData[key][iid]);
        });
        // Make a lookup of tableDataKey :image_id so that when we get clustered tableDAta
        // we can work out which image each 'row' of data came from (since we can't
        // include image ID in the cluster data)
        // We know the 'toCluster' list is in same order as imageIDs just now...
        let clusterLookup = imageIds.reduce((prev, iid, index) => {
            let dataString = toCluster[index].join(",");
            prev[dataString] = iid;
            return prev;
        }, {});
        // let toCluster = [[255, 255, 240],
        //     [20, 120, 102],
        //     [250, 255, 253],
        //     [100, 54, 300]];
        let threshold = 25000;
        var clusters = clusterfck.hcluster(toCluster, clusterfck.EUCLIDEAN_DISTANCE,
            clusterfck.AVERAGE_LINKAGE, threshold);
        let orderedResults = this.traverseCluster(clusters);

        let orderedImageIds = orderedResults.map(res => clusterLookup[res.join(",")]);
        return orderedImageIds;
    }

    traverseCluster(clusters) {

        let out = [];
        function traverseNode(node) {
            if (node.left && node.right) {
                traverseNode(node.left);
                traverseNode(node.right);
            } else {
                out.push(node.value);
            }
        }
        clusters.forEach(n => {traverseNode(n)});
        return out;
    }

    render() {
        let {imgJson, iconSize, tableData, selectedWellIds} = this.props;
        if (this.state.sortBy != undefined) {
            let orderedImageIds;
            if (this.state.sortBy === "cluster") {
                orderedImageIds = this.clusterTableData();
            } else {
                let colDataToSort = this.props.tableData[this.state.sortBy];
                // convert {iid: value} to [value, iid]
                let dataList = [];
                for (var iid in colDataToSort) {dataList.push([iid, colDataToSort[iid]])};
                dataList.sort((a, b) => a[1] < b[1] ? -1 : 1);
                orderedImageIds = dataList.map(l => l[0]);
            }
            if (orderedImageIds) {
                // sort filteredImages by ID...
                // create lookup {iid: image}
                let imgLookup = imgJson.reduce((prev, img) => {
                    prev[img.id] = img;
                    return prev;
                }, {});
                imgJson = orderedImageIds.map(iid => imgLookup[iid]);
            }
        }

        let columnNames = Object.keys(tableData);

        let dataRanges = columnNames.reduce((prev, name) => {
            let mn = Object.values(tableData[name]).reduce((p, v) => Math.min(p, v));
            let mx = Object.values(tableData[name]).reduce((p, v) => Math.max(p, v));
            prev[name] = [mn, mx]
            return prev;
        }, {});
        function heatMapColor(name, value) {
            let minMax = dataRanges[name];
            let fraction = (value - minMax[0])/(minMax[1] - minMax[0]);
            return getHeatmapColor(fraction);
        }

        return (
            <div className="parade_centrePanel">
                <table className="parade_dataTable" ref="dataTable">
                    <tbody>
                    <tr>
                        <td>
                            <a onClick={(event) => {this.handleSortTable(event, "cluster")}}>
                                Cluster
                            </a>
                        </td>
                        <td>Name</td>
                        {columnNames.map(name => (
                            <td key={name}>
                                <a onClick={(event) => {this.handleSortTable(event, name)}}>
                                    {name}
                                </a>
                                <input
                                    onClick={(event) => {this.handleShowHeatmap(event, name)}}
                                    type="checkbox"
                                    title="Show Heatmap"/>
                            </td>
                        ))}
                    </tr>
                    {imgJson.map(image => (
                        <tr
                            key={image.id + (image.parent ? image.parent : "")}>
                            <td>
                                <img alt="image"
                                    className={(image.selected || selectedWellIds.indexOf(image.wellId)) > -1 ? 'ui-selected' : ''}
                                    width={iconSize + "px"}
                                    height={iconSize + "px"}
                                    src={"/webgateway/render_thumbnail/" + image.id + "/"}
                                    title={image.name}
                                    data-id={image.id}
                                    data-wellid={image.wellId}
                                    onClick={event => {this.props.handleImageWellClicked(image, event)}} />
                            </td>
                            <td>
                                {image.name}
                            </td>
                            {columnNames.map(name => (
                                <td key={name}
                                    style={{backgroundColor: this.state.showHeatmapColumns[name] ? heatMapColor(name, tableData[name][image.id]): 'transparent'}}
                                    >
                                    {tableData[name][image.id]}
                                </td>
                            ))}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        );
    }
}

export default DataTable
