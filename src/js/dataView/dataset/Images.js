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

import ImageIcon from './ImageIcon'
import { getHeatmapColor } from '../../util';

class Images extends React.Component {

    constructor(props) {
        super(props);
    }

    heatmapColor(dataRange, value) {
        let [minimum, maximum] = dataRange;
        let fraction = (value - minimum) / (maximum - minimum);
        return getHeatmapColor(fraction);
    }

    render() {
        let {imgJson,
             iconSize,
             handleImageWellClicked,
             tableData,
             heatmapTableData} = this.props;

        const selectedTableData = tableData[heatmapTableData];
        return (
            <ul>
                {imgJson.map(image => {
                    const imageId = image.id;
                    let heatmapColor;
                    let heatmapValue;
                    if (selectedTableData) {
                        heatmapValue = selectedTableData.data[imageId];
                        heatmapColor = this.heatmapColor(
                            [selectedTableData.min, selectedTableData.max],
                            heatmapValue
                        );
                    }
                    return (
                        <ImageIcon
                            image={image}
                            src={this.props.thumbnails[imageId]}
                            // If images in Datasets, use parent to make unique
                            key={imageId + (image.parent ? image.parent : "")}
                            iconSize={iconSize}
                            handleImageWellClicked={handleImageWellClicked}
                            heatmapColor={heatmapColor}
                            heatmapValue={heatmapValue}
                        />
                    )
                })}
            </ul>
        );
    }
}

export default Images
