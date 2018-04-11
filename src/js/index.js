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
import ReactDOM from 'react-dom';
import App from './App';
import SearchApp from './search/SearchApp';

function renderNothing(selected) {
    if (selected.length === 0) {
        return true;
    }
    let dtype = selected[0].type;
    if (dtype === "image") {
        return false;
    }
    // Don't support multiple selection of anything except images
    if (selected.length > 1 && dtype !== "image") {
        return true;
    }
    // Only some parent types supported
    if (!App.PARENT_TYPES.includes(dtype)) {
        return true;
    }
}

function getParentNode(selected, jstree) {
    // See http://will-moore.github.io/react-render-purely-props-and-state/

    // If parentNode is a Dataset, but we're already showing Parent project
    // we want to keep the same Project as parent

    // OR if nothing is selected, we continue to render same parent

    // If unsupported objects selected, we return and show nothing
    if (renderNothing(selected)) {
        return;
    }

    // If a supported parent is selected, will only be 1
    let parentNode;
    let dtype = selected[0].type;
    if (App.PARENT_TYPES.includes(dtype)) {
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

// Export a function for rendering omero_parade as a centre panel plugin
function omero_parade(selected, jstree) {
    let parentNode = getParentNode(selected, jstree);
    let key = App.createKey(parentNode, jstree);

    ReactDOM.render(
        <App
            key={key}
            selected={selected}
            parentNode={parentNode}
            jstree={jstree} />,
        document.getElementById('omero_parade')
    );
}

// Full page app
function full_page_app(element_id) {
    ReactDOM.render(
        <SearchApp />,
        document.getElementById(element_id)
    );
}

export { omero_parade, full_page_app }
