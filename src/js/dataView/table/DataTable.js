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

class DataTable extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            showHeatmapColumns: {},
            sortBy: undefined,
            sortReverse: false,
        }
        this.handleSortTable = this.handleSortTable.bind(this);
        this.handleShowHeatmap = this.handleShowHeatmap.bind(this);
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
        // if already sorting by this key, toggle sortReverse
        this.setState(prevState => ({
            sortBy: name,
            sortReverse: prevState.sortBy === name ? !prevState.sortReverse : false,
        }));
    }

    handleShowHeatmap(event, name) {
        let checked = event.target.checked;
        let showHeatmapColumns = Object.assign({}, this.state.showHeatmapColumns);
        showHeatmapColumns[name] = checked;
        this.setState({
            showHeatmapColumns: showHeatmapColumns
        });
    }

    render() {
        let {imgJson, iconSize, tableData, selectedWellIds} = this.props;
        if (this.state.sortBy != undefined) {
            // let orderedImageIds;
            let colDataToSort = this.props.tableData[this.state.sortBy];
            // Add a sortKey to imgJson
            imgJson = imgJson.map(i => Object.assign(i, {sortKey: colDataToSort[i.id]}));
            // sort...
            let reverse = this.state.sortReverse ? -1 : 1;
            imgJson.sort((a, b) => {
                if (a.sortKey === undefined) return -reverse;
                if (b.sortKey === undefined) return reverse;
                return a.sortKey < b.sortKey ? -reverse : reverse;
            });
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
