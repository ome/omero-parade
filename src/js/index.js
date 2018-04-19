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

// Export a function for rendering omero_parade as a centre panel plugin
function omero_parade(jstree) {
    ReactDOM.render(
        <App jstree={jstree} />,
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
