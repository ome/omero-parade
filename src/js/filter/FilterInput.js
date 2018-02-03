
import React, { Component } from 'react';
import { getHeatmapColor } from '../util'


const FilterInput = ({paramIndex, filter, onChange}) => {

    if (filter.values) {
        return (
            <select
                onChange={event => {onChange(event, paramIndex);}}
                title={filter.title ? filter.title : ''}
                >
                {filter.values.map(value => (<option value={value}>{value}</option>))}
            </select>
        )
    }
    return (
        <input
            type={filter.type}
            onChange={event => {onChange(event, paramIndex)}}
            title={filter.title ? filter.title : ''}
        />
    )
}

export default FilterInput
