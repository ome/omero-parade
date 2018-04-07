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
import { getHeatmapColor } from '../util'


class FilterInput extends React.Component {
    
    render() {
        let param = this.props.param;
        let filterChanged = this.props.onChange;
        let onChange = function (event) {
            let value = event.target.value;
            if (param.type === 'number'){
                value = parseInt(value, 10);
            }
            filterChanged(param.name, value);
        }

        if (param.values) {
            return (
                <select
                    name={param.name}
                    onChange={onChange}
                    title={param.title ? param.title : ''}
                    >
                    {param.values.map(value => (
                        <option
                            key={value}
                            value={value}>
                                {value}
                        </option>))
                    }
                </select>
            )
        }
        let type = param.type;
        if (this.props.min != undefined && this.props.max != undefined) {
            type = 'range';
        }
        return (
            <input
                name={param.name}
                type={type}
                min={this.props.min}
                max={this.props.max}
                onChange={onChange}
                title={param.title ? param.title : ''}
            />
        )
    }
}

export default FilterInput
