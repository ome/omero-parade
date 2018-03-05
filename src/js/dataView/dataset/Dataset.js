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

class Dataset extends React.Component {

    componentDidMount() {
        $(this.refs.dataIcons).selectable({
            filter: 'li.datasetThumb',
            distance: 2,
            stop: () => {
                // Make the same selection in the jstree etc
                let ids = [];
                $(".parade_centrePanel .ui-selected").each(function(){
                    ids.push(parseInt($(this).attr('data-id'), 10));
                });
                this.props.setImagesWellsSelected('image', ids);
            },
        });
    }

    componentWillUnmount() {
        // cleanup plugin
        $(this.refs.dataIcons).selectable( "destroy" );
    }

    render() {
        let {imgJson, iconSize, setIconSize, 
             layout, setLayout} = this.props;

        // imgJson may come from several Datasets
        // Each image has datasetName and datasetId
        // Create list of datases [ {name: 'name', id:1, images: [imgs]} ]
        let datasets = imgJson.reduce((prev, img, idx, imgList) => {
            // if the last dataset is different from current one,
            // start new Dataset
            if (idx === 0 || imgList[idx - 1].datasetId !== img.datasetId) {
                prev.push({name: img.datasetName,
                           id: img.datasetId,
                           images: []})
            }
            // Add image to the last Dataset
            prev[prev.length-1].images.push(img);
            return prev;
        }, []);

        return (
            <div className="parade_centrePanel"
                ref="dataIcons">
                {datasets.map(dataset => (
                    <div key={dataset.id}>
                        <h2>{dataset.name}</h2>
                        <ul
                            className={layout + "Layout"}>
                            {dataset.images.map(image => (
                                <ImageIcon
                                    image={image}
                                    // If images in Datasets, use parent to make unique
                                    key={image.id + (image.parent ? image.parent : "")}
                                    iconSize={iconSize}
                                    handleImageWellClicked={this.props.handleImageWellClicked} />
                            ))}
                        </ul>
                        <div style={{clear: 'both'}}></div>
                    </div>
                ))}
            </div>
        );
    }
}

export default Dataset
