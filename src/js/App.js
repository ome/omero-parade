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
import DataContainer from './dataLoader/DataContainer'


class App extends Component {

    constructor(props) {
        super(props);
        this.parentTypes = ["project",
                            "dataset",
                            "orphaned",
                            "tag",
                            "share",
                            "plate",
                            "acquisition"]
    }

    renderNothing(selected) {
        if (selected.length === 0) {
            if (this.previousParent) {
                return false;
            }
            return true;
        }
        var dtype = selected[0].type;
        if (dtype === "image") {
            return false;
        }
        // Don't support multiple selection of anything except images
        if (selected.length > 1 && dtype !== "image") {
            return true;
        }
        // Only some parent types supported
        if (this.parentTypes.indexOf(dtype) === -1) {
            return true;
        }
    }

    componentWillReceiveProps(nextProps) {
        // When props change...
        // If nothing is selected AND the previous node is valid
        // We continue to render that node (Dataset)
        // if (nextProps.selected.length !== 0) {
        //     delete(this.previousParent);
        // }
    }

    getParentNode() {
        // See http://will-moore.github.io/react-render-purely-props-and-state/

        // If parentNode is a Dataset, but we're already showing Parent project
        // we want to keep the same Project as parent

        // OR if nothing is selected, we continue to render same parent

        var selected = this.props.selected,
            jstree = this.props.jstree;

        // If unsupported objects selected, we return and show nothing
        if (this.renderNothing(selected)) {
            return;
        }
        
        // If nothing selected, continue to show same parent / data
        if (selected.length === 0 && this.previousParent) {
            return this.previousParent;
        }

        // If a supported parent is selected, will only be 1
        let parentNode;
        var dtype = selected[0].type;
        if (this.parentTypes.indexOf(dtype) > -1) {
            parentNode = selected[0];
        }

        // Selected an image, we simply show it's container
        if (dtype === "image") {
            parentNode = jstree.get_node(jstree.get_parent(selected[0]));
        }

        // If we've got a Dataset within Project, return the Project
        if (parentNode) {
            let p = jstree.get_node(jstree.get_parent(parentNode));
            if (p.type === "project") {
                parentNode = p;
            }
        }
        return parentNode;
    }

    render() {
        // parentNode may be null if not suitable to display
        let parentNode = this.getParentNode();

        if (parentNode) {
            this.previousParent = parentNode;
            return (
                <DataContainer
                    // key to force re-mounting when parent changes
                    // This is node ID not Project or Dataset ID
                    key={parentNode.id}
                    parentNode={parentNode}
                    jstree={this.props.jstree} />
            )
        }

        return (
            <div></div>
        );
    }
}

export default App
