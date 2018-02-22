
import React, { Component } from 'react';

const Well = React.createClass({

    // shouldComponentUpdate: function(nextProps, nextState) {
    //     // Only re-render if visibility changes
    //     return this.props.hidden !== nextProps.hidden;
    // },

    render: function() {
        let {id,
               iconSize,
               selected,
               hidden,
               row,
               col,
               thumb_url,
               imgTableData,
               handleWellClick,
               selectedHeatmap,
               heatmapRange,
               heatmapValues} = this.props;


        let heatmapColor = "rgba(255,255,255,0)";   // transparent by default
        let title = "" + row + col; // E.g. A1
        title = title + " " + imgTableData.join(" ");
        let imgStyle = {width: iconSize + 'px', maxHeight: iconSize + 'px'};
        if (hidden) {
            imgStyle.opacity = 0.1;
        }
        let divStyle = {width: iconSize + 'px', height: iconSize + 'px'};
        let cls = "";

        // if (selectedHeatmap) {
        //     var value = heatmapValues[selectedHeatmap];
        //     title += " " + value;
        //     if (heatmapRange && value) {
        //         var fraction = (value - heatmapRange[0]) / (heatmapRange[1] - heatmapRange[0]);
        //         heatmapColor = getHeatmapColor(fraction);
        //         divStyle.background = heatmapColor;
        //         cls += "heatmap";
        //     }
        // }
        if (selected) {
            cls += " ui-selected";
        }

        return (
            <td className={"well " + cls}
                data-wellId={id}
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
});

export default Well
