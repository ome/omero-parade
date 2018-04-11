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
import FieldsLoader from './plateLoader/FieldsLoader'
import DatasetContainer from './datasetLoader/DatasetContainer';


class DataContainer extends React.Component {

    constructor(props) {
        super(props);
        this.setSelectedImages = this.setSelectedImages.bind(this);
    }

    setSelectedImages(imageIds) {
        let jstree = this.props.jstree;
        if (jstree) {
            jstree.deselect_all();
            if (imageIds.length === 0) return;
            let containerNode = OME.getTreeImageContainerBestGuess(imageIds[0]);
            let nodes = imageIds.map(iid => {
                let containerNode = OME.getTreeImageContainerBestGuess(iid);
                return jstree.locate_node('image-' + iid, containerNode)[0]
            });
            jstree.select_node(nodes);
            // we also focus the node, so that hotkey events come from the node
            if (nodes.length > 0) {
                $("#" + nodes[0].id).children('.jstree-anchor').focus();
            }
        }
    }

    render() {
        var jstree = this.props.jstree;
        var parentNode = this.props.parentNode;
        var parentNodeId = parentNode.data.id;

        // If not loaded, show nothing (don't know how many children plate will have)
        if (!parentNode.state.loaded) {
            return (<h2 className="iconTable">Loading...</h2>);
        }
        // If plate has > 1 run, show nothing
        if (parentNode.type === "plate" && parentNode.children.length > 1) {
            return (<h2 className="iconTable">Select Run</h2>);
        }
        // If Project has no open Datasets, offer to open them all
        if (parentNode.type === "project") {
            let openChildren = parentNode.children.filter(
                child => jstree.is_open(child)
            );
            if (openChildren.length < 1) {
                return (
                    <div className="parade_openAll">
                        <h1>No open Datasets</h1>
                        <button
                            onClick={() => {
                                this.props.jstree.open_all(
                                    this.props.parentNode.id
                                )
                            }}>
                            Open All
                        </button>
                    </div>
                );
            }
        }

        // Plate or Run as key identifies the content of center panel.
        var key = parentNode.id;
        if (parentNode.type === "plate" && parentNode.children.length === 1) {
            // Children is list of node-ids
            key = parentNode.children[0];
        }

        // We pass key to <FieldsLoader> so that if key doesn't change,
        // Plate won't mount (load data) again
        let rv = (<div>OOps {parentNode.type}</div>);
        if (parentNode.type == "plate" || parentNode.type == "aquisition") {
            if (parentNode.type == "acquisition") {
                parentNodeId = jstree.get_node(jstree.get_parent(parentNode)).data.id;
            }

            rv = (
                <FieldsLoader
                    plateId={parentNodeId}
                    parentNode={parentNode}
                    key={key}/>
            )
        }
        if (parentNode.type === "dataset" || parentNode.type === "project") {
            rv = (
                <DatasetContainer
                    jstree={jstree}
                    parentNode={parentNode}
                    setSelectedImages={this.setSelectedImages}
                    key={key}/>
            )
        }
        return rv;
    }
}

export default DataContainer
