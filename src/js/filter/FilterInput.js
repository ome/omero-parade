
import React, { Component } from 'react';
import { getHeatmapColor } from '../util'


const FilterInput = ({paramIndex, type, onChange}) => {

    return (
        <input
            type={type}
            onChange={event => {
                onChange(event, paramIndex);
            }}
        />
    )
}

export default FilterInput
