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

class DatasetTable extends React.Component {


    render() {
        let {tableTitle, imgJson, iconSize, tableData, selectedWellIds,
             sortBy, sortReverse, showHeatmapColumns,
             handleSortTable, handleShowHeatmap,
             handleImageWellClicked} = this.props;
        if (sortBy != undefined) {
            // let orderedImageIds;
            let colDataToSort = tableData[sortBy].data;
            // Add a sortKey to imgJson
            imgJson = imgJson.map(i => Object.assign(i, {sortKey: colDataToSort[i.id]}));
            // sort...
            let reverse = sortReverse ? -1 : 1;
            imgJson.sort((a, b) => {
                if (a.sortKey === undefined) return -reverse;
                if (b.sortKey === undefined) return reverse;
                return a.sortKey < b.sortKey ? -reverse : reverse;
            });
        }

        let columnNames = Object.keys(tableData);

        let dataRanges = columnNames.reduce((prev, name) => {
            let v = tableData[name];
            prev[name] = [v.min, v.max];
            return prev;
        }, {});
        function heatMapColor(name, value) {
            let minMax = dataRanges[name];
            let fraction = (value - minMax[0])/(minMax[1] - minMax[0]);
            return getHeatmapColor(fraction);
        }

        return (
            <tbody>
                {tableTitle ? <tr><th colSpan={columnNames.length + 2}>
                                    {tableTitle}
                              </th></tr> : ""}
                <tr>
                    <td>
                    </td>
                    <td>Name</td>
                    {columnNames.map(name => (
                        <td key={name}>
                            <a onClick={(event) => {handleSortTable(event, name)}}>
                                {name}
                            </a>
                            <input
                                onClick={(event) => {handleShowHeatmap(event, name)}}
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
                                style={{backgroundColor: showHeatmapColumns[name] ? heatMapColor(name, tableData[name].data[image.id]): 'transparent'}}
                                >
                                {tableData[name].data[image.id]}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        );
    }
}

export default DatasetTable
