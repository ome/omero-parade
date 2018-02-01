
import React, { Component } from 'react';
import { getHeatmapColor } from '../util'


const Well = ({id,
               iconSize,
               selected,
               row,
               col,
               thumb_url,
               handleWellClick,
               selectedHeatmap,
               heatmapRange,
               heatmapValues}) => {

    let heatmapColor = "rgba(255,255,255,0)";   // transparent by default
    let title = "" + row + col; // E.g. A1
    let imgStyle = {width: iconSize + 'px', maxHeight: iconSize + 'px'};
    let divStyle = {width: iconSize + 'px', height: iconSize + 'px'};
    let cls = "";

    if (selectedHeatmap) {
        var value = heatmapValues[selectedHeatmap];
        title += " " + value;
        if (heatmapRange && value) {
            var fraction = (value - heatmapRange[0]) / (heatmapRange[1] - heatmapRange[0]);
            heatmapColor = getHeatmapColor(fraction);
            divStyle.background = heatmapColor;
            cls += "heatmap";
        }
    }
    if (selected) {
        cls += " ui-selected";
    }

    return (
        <td className={"well " + cls}
            title={""+row+col}>
            <div
                style={divStyle}
                onClick={event => {handleWellClick(event, id)}}
                title={title}
                >
                <img
                    src={thumb_url}
                    style={imgStyle} />
            </div>
        </td>
    )
}

export default Well
