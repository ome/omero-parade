
import React, { Component } from 'react';
import { getHeatmapColor } from '../util'


const FilterInput = React.createClass({
    
    render: function() {
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
        return (
            <input
                name={param.name}
                type={param.type}
                onChange={onChange}
                title={param.title ? param.title : ''}
            />
        )
    }
});

export default FilterInput
