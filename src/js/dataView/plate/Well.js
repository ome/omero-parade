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

import Layout from '../Layout';
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
               field,
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
        const title = "" + row + col; // E.g. A1
        let imgStyle = {width: iconSize + 'px', maxHeight: iconSize + 'px'};
        if (hidden) {
            imgStyle.opacity = 0.1;
        }
        let divStyle = {width: iconSize + 'px', height: iconSize + 'px'};
        let className = ["well"];

        let heatmapValue;
        if (selectedTableData && !hidden) {
            heatmapValue = selectedTableData.data[iid];
            divStyle.background = this.heatmapColor(
                [selectedTableData.min, selectedTableData.max],
                heatmapValue
            );
            className.push("heatmap");
        }
        if (selected) {
            className.push("ui-selected");
        }

        let imgClassName = "";
        let src = this.props.thumb_url;
        if (!src) {
            if (hidden) {
                src = Layout.ONE_X_ONE_GROUP_GRAY;
            } else {
                imgClassName = "waiting";
                src = config.staticPrefix + "webgateway/img/spacer.gif";
            }
        }
        return (
            <td className={className.join(" ")}
                data-wellid={id}
                data-imageid={iid}
                data-field={field}
                title={title}>
                <div
                    style={divStyle}
                    onClick={event => {handleWellClick(event, id)}}
                    title={title}
                    >
                    <img
                        className={imgClassName}
                        src={src}
                        style={imgStyle} />
                    <div
                        style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            fontColor: "white"
                        }}
                    >
                        <span style={{color: "white"}}>
                            {heatmapValue}
                        </span>
                    </div>
                </div>
            </td>
        )
    }
}

export default Well
