
import React, { Component } from 'react';
import Well from './Well';


const PlateGrid = React.createClass({

    getInitialState: function() {
        return {}
    },

    componentDidMount: function() {
        $(this.refs.plateGrid).selectable({
            filter: 'td.well',
            distance: 2,
            stop: () => {
                // Make the same selection in the jstree etc
                let ids = [];
                $(".plateGrid .ui-selected").each(function(){
                    ids.push(parseInt($(this).attr('data-wellId'), 10));
                });
                this.props.setImagesWellsSelected('well', ids);
            },
        });
    },

    componentWillUnmount: function() {
        // cleanup plugin
        $(this.refs.dataIcons).selectable( "destroy" );
    },

    render: function() {
        var data = this.props.plateData,
            iconSize = this.props.iconSize,
            placeholderStyle = {
                width: iconSize + 'px',
                height: iconSize + 'px',
            },
            selectedWellIds = this.props.selectedWellIds,
            handleImageWellClicked = this.props.handleImageWellClicked,
            tableData = this.props.tableData,
            filteredIds = this.props.filteredImages.map(i => i.id);
        if (!data) {
            return (
                <table />
            )
        }
        var columnNames = data.collabels.map(function(l){
            return (<th key={l}>{l}</th>);
        });
        var grid = data.grid;
        var rows = data.rowlabels.map((r, rowIndex) => {
            var wells = data.collabels.map((c, colIndex) => {
                var well = grid[rowIndex][colIndex];
                if (well) {
                    var hidden = (filteredIds !== undefined && filteredIds.indexOf(well.id) === -1);
                    var selected = selectedWellIds.indexOf(well.wellId) > -1;
                    // lookup this Well's data from heatmap
                    // var heatmapValues = heatmapData && heatmapData[well.wellId+""];
                    // tableData is mapped to Image IDs... (well.id is image ID!)
                    var imgTableData = Object.keys(tableData).map(col => col + ": " + tableData[col][well.id])
                    return (
                        <Well
                            key={well.wellId}
                            id={well.wellId}
                            iid={well.id}
                            thumb_url={well.thumb_url}
                            selected={selected}
                            hidden={hidden}
                            iconSize={iconSize}
                            handleWellClick={(event) => {handleImageWellClicked(well, event)}}
                            row={r}
                            col={c}
                            imgTableData={imgTableData} />
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
            <div className="plateGrid" ref="plateGrid">
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
