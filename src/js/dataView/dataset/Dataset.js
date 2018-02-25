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

const Dataset = React.createClass({

    componentDidMount: function() {
        $(this.refs.dataIcons).selectable({
            filter: 'li.datasetThumb',
            distance: 2,
            stop: () => {
                // Make the same selection in the jstree etc
                let ids = [];
                $(".parade_centrePanel .ui-selected").each(function(){
                    ids.push(parseInt($(this).attr('data-id'), 10));
                });
                console.log('Dataset', ids);
                this.props.setImagesWellsSelected('image', ids);
            },
        });
    },

    componentWillUnmount: function() {
        // cleanup plugin
        $(this.refs.dataIcons).selectable( "destroy" );
    },

    render() {
        let {imgJson, iconSize, setIconSize, 
             layout, setLayout} = this.props;

        return (
            <div className="parade_centrePanel">
                <ul
                    ref="dataIcons"
                    className={layout + "Layout"}>
                    {imgJson.map(image => (
                        <ImageIcon
                            image={image}
                            key={image.id}
                            iconSize={iconSize}
                            handleImageWellClicked={this.props.handleImageWellClicked} />
                    ))}
                </ul>
            </div>
        );
    }
});

export default Dataset
