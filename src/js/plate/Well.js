
import React, { Component } from 'react';


const Well = ({id, iconSize, selected, row, col, thumb_url, handleWellClick}) => {
    return (
        <td className={"well " + (selected ? "ui-selected" : "")}
            title={""+row+col}>
            <img
                src={thumb_url}
                onClick={event => {handleWellClick(event, id)}}
                style={{width: iconSize, maxHeight: iconSize}} />
        </td>
    )
}

export default Well
