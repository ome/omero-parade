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
import FilterHub from '../../filter/FilterHub'


const DatasetContainer = React.createClass({

    marshalNode: function(node) {
        var parentNode = this.props.parentNode;
        var dateFormatOptions = {
            weekday: "short", year: "numeric", month: "short",
            day: "numeric", hour: "2-digit", minute: "2-digit"
        };
        var d = node.data.obj.date || node.data.obj.acqDate;
        var date = new Date(d);
        date = date.toLocaleTimeString(undefined, dateFormatOptions);
        var iData = {'id': node.data.obj.id,
            'name': node.text,
            'data': JSON.parse(JSON.stringify(node.data)),
            'selected': node.state.selected,
            'date': date,
        };
        // If image is in share and share is not owned by user...
        if (node.data.obj.shareId && !parentNode.data.obj.isOwned) {
            // share ID will be needed to open image viewer
            iData.shareId = node.data.obj.shareId;
        }
        return iData;
    },

    getImageNodes: function() {
        let imgNodes = [],
            jstree = this.props.jstree;

        this.props.parentNode.children.forEach(function(ch){
            var childNode = jstree.get_node(ch);
            // Ignore non-images under tags or 'deleted' under shares
            if (childNode.type == "image") {
                imgNodes.push(childNode);
            }
        });
        return imgNodes;
    },

    render: function() {
        var imgNodes = this.getImageNodes();

        // Convert jsTree nodes into json for template
        let imgJson = imgNodes.map(this.marshalNode);

        // Get selected filesets...
        let selFileSets = imgJson.filter(i => i.selected).map(i => i.data.obj.filesetId);
        // ...go through all images, adding fs-selection flag if in selected fileset
        if (selFileSets.length > 0) {
            imgJson.forEach(function(img){
                if (selFileSets.indexOf(img.data.obj.filesetId) > -1) {
                    img.fsSelected = true;
                }
            });
        }

        return (<FilterHub
                datasetId={this.props.parentNode.data.obj.id}
                setSelectedImages = {this.props.setSelectedImages}
                images={imgJson}
            />)
    }
});

export default DatasetContainer
