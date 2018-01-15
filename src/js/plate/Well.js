
import React, { Component } from 'react';


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
    let imgStyle = {width: iconSize, maxHeight: iconSize};
    let divStyle = {width: iconSize, height: iconSize};

    let getHeatmapColor = function(fraction) {
        // we only support one LUT just now
        var red = parseInt(255 * fraction),
            green = parseInt(255 * (1 - fraction)),
            blue = 0,
            alpha = 1;
        return "rgba(" + [red, green, blue, alpha].join(",") + ")";
    };

    if (selectedHeatmap) {
            var value = heatmapValues[selectedHeatmap];
            title += " " + value;
            if (heatmapRange && value) {
                var fraction = (value - heatmapRange[0]) / (heatmapRange[1] - heatmapRange[0]);
                heatmapColor = getHeatmapColor(fraction);
                divStyle.background = heatmapColor;
                imgStyle.display = 'none';
            }
        }

    return (
        <td className={"well " + (selected ? "ui-selected" : "")}
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
