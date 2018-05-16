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

class Well extends React.Component {

    heatmapColor(dataRange, value) {
        let [minimum, maximum] = dataRange;
        let fraction = (value - minimum) / (maximum - minimum);
        return getHeatmapColor(fraction);
    }

    render() {
        let {id,
               iid,
               iconSize,
               selected,
               hidden,
               row,
               col,
               thumb_url,
               tableData,
               heatmapTableData,
               handleWellClick,
               viewMode} = this.props;

        const selectedTableData = tableData[heatmapTableData];
        let heatmapColor = "rgba(255,255,255,0)";   // transparent by default
        let title = "" + row + col; // E.g. A1
        let imgStyle = {width: iconSize + 'px', maxHeight: iconSize + 'px'};
        if (hidden) {
            imgStyle.opacity = 0.1;
        }
        let divStyle = {width: iconSize + 'px', height: iconSize + 'px'};
        let className = ["well"];

        if (selectedTableData && !hidden) {
            divStyle.background = this.heatmapColor(
                [selectedTableData.min, selectedTableData.max],
                selectedTableData.data[iid]
            );
            className.push("heatmap");
        }
        if (selected) {
            className.push("ui-selected");
        }

        let imgClassName = "";
        let src = this.props.thumb_url;
        if (!src && !hidden) {
            imgClassName = "waiting";
            src = config.staticPrefix + "webgateway/img/spacer.gif";
        }
        return (
            <td className={className.join(" ")}
                data-wellid={id}
                data-imageid={iid}
                title={""+row+col}>
                <div
                    style={divStyle}
                    onClick={event => {handleWellClick(event, id)}}
                    title={title}
                    >
                    <img
                        className={imgClassName}
                        src={src}
                        style={imgStyle} />
                </div>
            </td>
        )
    }
}

export default Well
