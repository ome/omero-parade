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

    constructor(props) {
        super(props);

        this.onParamSelectChanged = this.onParamSelectChanged.bind(this);
        this.onRangeValueChanged = this.onRangeValueChanged.bind(this);
        this.onInputValueChanged = this.onInputValueChanged.bind(this);
    }

    /** Returns a figure space padded version of the current value. */
    getPaddedValue() {
        let max = this.props.max;
        let value = parseFloat(this.props.value);
        if (isNaN(value)) {
            value = this.props.value;
        } else if (parseInt(max) === max) {
            // If max is Integer, we format value as integer
            value = parseInt(value)
        } else {
            value = value.toFixed(2)
        }
        if (max == undefined) {
            return value;
        }
        let padding = parseInt(max).toString().length - parseInt(value).toString().length;
        // In case we just switched Table column and old value > new max
        padding = Math.max(0, padding);
        return "\u2007".repeat(padding) + value;
    }

    /**
     * Triggered whenever the select element changes.  Dispatches the
     * change action in a generic way, including the filter base parameter
     * name by way of the provided singular change handler.
     */
    onParamSelectChanged(event) {
        this.props.onChange(this.props.param.name, event.target.value);
    }

    /**
     * Triggered whenever the value changes and it is a range input.
     * Dispatches the change action in a generic way, including the
     * filter base parameter name by way of the provided singular
     * change handler.
     */
    onRangeValueChanged(event) {
        this.props.onChange(this.props.param.name, event.target.value);
    }

    /**
     * Triggered whenever the value changes and it is regular input.
     * Dispatches the change action in a generic way, including the
     * filter base parameter name by way of the provided singular
     * change handler.
     */
    onInputValueChanged(event) {
        this.props.onChange(this.props.param.name, event.target.value);
    }
    
    render() {
        let param = this.props.param;
        if (param.values) {
            return (
                <select
                    name={param.name}
                    onChange={this.onParamSelectChanged}
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
        if (this.props.min != undefined && this.props.max != undefined) {
            return (
                <span>
                    <span>{this.getPaddedValue()}</span>
                    <input
                        name={param.name}
                        type='range'
                        min={this.props.min}
                        max={this.props.max}
                        onChange={this.onRangeValueChanged}
                        title={param.title ? param.title : ''}
                    />
                </span>
            )
        }
        return (
            <input
                name={param.name}
                type={param.type}
                min={this.props.min}
                max={this.props.max}
                onChange={this.onInputValueChanged}
                title={param.title ? param.title : ''}
            />
        )
    }
}

export default FilterInput
