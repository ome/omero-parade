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

    static get PARENT_TYPES() {
        return ["project",
                "dataset",
                "orphaned",
                "tag",
                "share",
                "plate",
                "acquisition"]
    }

    static createKey(parentNode, jstree) {
        let key = parentNode? parentNode.id : undefined;
        // Project + *open* Datasets as key identifies the content of the
        // center panel.
        if (parentNode && parentNode.type === "project") {
            let atoms = parentNode.children.filter(
                child => jstree.is_open(child)
            );
            atoms.unshift(key);
            key = atoms.join("-");
        }
        // TODO: This would be where we would start the work handling
        // Screen + *open* Plates as key
        return key;
    }

    constructor(props) {
        super(props);
    }

    render() {
        // parentNode may be null if not suitable to display
        let parentNode = this.props.parentNode;
        let key = App.createKey(parentNode, this.props.jstree);
        if (parentNode) {
            this.previousParent = parentNode;
            return (
                <DataContainer
                    key={key}
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
