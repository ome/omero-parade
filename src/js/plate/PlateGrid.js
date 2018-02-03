
import React, { Component } from 'react';
import Well from './Well';


const PlateGrid = React.createClass({


    // Uses the url ?show=well-123 or image-123 to get well IDs from data
    getWellIdsFromUrlQuery: function(data) {
        var param = OME.getURLParameter('show'),
            wellIds = [];
        if (param) {
            param.split("|").forEach(function(p) {
                var wellId, imgId;
                if (p.split("-")[0] === "well") {
                    wellId = parseInt(p.split("-")[1], 10);
                } else if (p.split("-")[0] === "image") {
                    imgId = parseInt(p.split("-")[1], 10);
                }
                // Validate well Id is in this plate
                wellId = this.getWellId(data, wellId, imgId);
                if (wellId) {
                    wellIds.push(wellId);
                }
            }.bind(this));
        }
        return wellIds;
    },

    // Find well in data using wellId OR imageId, return wellId
    getWellId: function (data, wellId, imageId) {
        var wellId;
        data.grid.forEach(function(row){
            row.forEach(function(well) {
                if (well && (well.id === imageId || well.wellId === wellId)) {
                    wellId = well.wellId;
                }
            });
        });
        return wellId;
    },

    getInitialState: function() {
        return {
            selectedWellIds: [],
        }
    },

    setSelectedWells: function(wellIds) {

        this.setState({selectedWellIds: wellIds});

        var well_index = this.props.fieldId;
        var selected_objs = wellIds.map(wId => ({id: 'well-' + wId, index: this.props.fieldId}))
        $("body")
            .data("selected_objects.ome", selected_objs)
            .trigger("selection_change.ome");
        // Update the buttons above jstree as if nothing selected
        // (but don't actually change selection in jstree).
        if (buttonsShowHide) {
            buttonsShowHide([]);
        }
    },

    handleWellClick: function(event, wellId) {
        // update selected state for range of wells etc...
        var isWellSelected = function(wellId) {
            return (this.state.selectedWellIds.indexOf(wellId) > -1);
        }.bind(this);

        if (event.shiftKey) {
            // select range
            var wellIds = [],
                selectedIdxs = [];
            // make a list of all well IDs, and index of selected wells...
            this.state.data.grid.forEach(function(row){
                row.forEach(function(w){
                    if (w) {
                        wellIds.push(w.wellId);
                        if (isWellSelected(w.wellId)) {
                            selectedIdxs.push(wellIds.length-1);
                        }
                    }
                });
            });
            // extend the range of selected wells with index of clicked well...
            var clickedIdx = wellIds.indexOf(wellId),
                newSel = [],
                startIdx = Math.min(clickedIdx, selectedIdxs[0]),
                endIdx = Math.max(clickedIdx, selectedIdxs[selectedIdxs.length-1]);
            //...and select all wells within that range
            wellIds.forEach(function(wellId, idx){
                if (startIdx <= idx && idx <= endIdx) {
                    newSel.push(wellId);
                }
            });
            this.setSelectedWells(newSel);

        } else if (event.metaKey) {
            // toggle selection of well
            var found = false;
            // make a new list from old, removing clicked well
            var s = this.state.selectedWellIds.map(function(id){
                if (wellId !== id) {
                    return id;
                } else {
                    found = true;
                }
            });
            // if well wasn't already seleced, then select it
            if (!found) {
                s.push(wellId);
            }
            this.setSelectedWells(s);
        } else {
            // Select only this well
            this.setSelectedWells([wellId]);
        }
    },

    render: function() {
        var data = this.props.plateData,
            selectedHeatmap = this.props.selectedHeatmap,
            heatmapRange = this.props.heatmapRange,
            heatmapData = this.props.heatmapData,
            iconSize = this.props.iconSize,
            placeholderStyle = {
                width: iconSize + 'px',
                height: iconSize + 'px',
            },
            selectedWellIds = this.state.selectedWellIds,
            handleWellClick = this.handleWellClick,
            filteredIds = this.props.filteredImageIds;
        console.log('PlateGrid, filteredImageIds', filteredIds)
        if (!data) {
            return (
                <table />
            )
        }
        var columnNames = data.collabels.map(function(l){
            return (<th key={l}>{l}</th>);
        });
        var grid = data.grid;
        var rows = data.rowlabels.map(function(r, rowIndex){
            var wells = data.collabels.map(function(c, colIndex){
                var well = grid[rowIndex][colIndex];
                if (well && (filteredIds === undefined || filteredIds.indexOf(well.id) > -1)) {
                    var selected = selectedWellIds.indexOf(well.wellId) > -1;
                    // lookup this Well's data from heatmap
                    var heatmapValues = heatmapData && heatmapData[well.wellId+""];
                    return (
                        <Well
                            key={well.wellId}
                            id={well.wellId}
                            iid={well.id}
                            thumb_url={well.thumb_url}
                            selected={selected}
                            iconSize={iconSize}
                            handleWellClick={handleWellClick}
                            row={r}
                            col={c}
                            selectedHeatmap={selectedHeatmap}
                            heatmapRange={heatmapRange}
                            heatmapValues={heatmapValues} />
                    )
                } else {
                    return (
                        <td className="placeholder" key={r + "_" + c}>
                            <div style={placeholderStyle} />
                        </td>);
                }
            });
            return (
                <tr key={r}>
                    <th>{r}</th>
                    {wells}
                </tr>
            );
        });

        return (
            <div className="plateGrid">
                <table>
                    <tbody>
                        <tr>
                            <th> </th>
                            {columnNames}
                        </tr>
                        {rows}
                    </tbody>
                </table>
            </div>
        );
    }
});

export default PlateGrid
