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
import PlateLoader from './PlateLoader';

class Plate extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            fields: [],
            selectedField: undefined,
        }
    }

    componentDidMount() {
        var parentNode = this.props.parentNode,
            plateId = this.props.plateId,
            objId = parentNode.data.id;
        var data;
        if (parentNode.type === "acquisition") {
            // select 'run', load plate...
            data = {'run': objId};
        } else if (parentNode.type == "plate") {
            // select 'plate', load if single 'run'
            if (parentNode.children.length < 2) {
                data = {'plate': objId};
            }
        } else {
            return;
        }

        var url = "/omero_parade/api/fields/";
        $.ajax({
            url: url,
            data: data,
            dataType: 'json',
            cache: false,
            success: function(data) {
                if (this.isMounted()) {
                    this.setState({
                        fields: data.data,
                        selectedField: data.data[0]
                    });
                }
            }.bind(this),
                error: function(xhr, status, err) {
            }.bind(this)
        });
    }

    render() {
        return (
            <PlateLoader
                key={this.state.selectedField}
                plateId={this.props.plateId}
                fieldId={this.state.selectedField} />
        )
    }
}

export default Plate
