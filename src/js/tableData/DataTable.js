
import React, { Component } from 'react';
import ImageIcon from '../dataset/ImageIcon';
import { getHeatmapColor } from '../util';

export default React.createClass({

    getInitialState: function() {
        return {
            showHeatmapColumns: {},
        }
    },

    componentDidMount: function() {
        var jstree = this.props.jstree;
        $(this.refs.dataIcons).selectable({
            filter: 'li.row',
            distance: 2,
            stop: function() {
                // Make the same selection in the jstree etc
                $(".ui-selected").each(function(){
                    var imageId = $(this).attr('data-id');
                    var containerNode = OME.getTreeImageContainerBestGuess(imageId);
                    var selectedNode = jstree.locate_node('image-' + imageId, containerNode)[0];
                    if (jstree) {
                        jstree.select_node(selectedNode);
                    }
                });
            },
            start: function() {
                if (jstree) {
                    jstree.deselect_all();
                }
            }
        });
    },

    componentWillUnmount: function() {
        // cleanup plugin
        $(this.refs.dataIcons).selectable( "destroy" );
    },

    handleShowHeatmap: function(event, name) {
        let checked = event.target.checked;
        let showHeatmapColumns = Object.assign({}, this.state.showHeatmapColumns);
        showHeatmapColumns[name] = checked;
        this.setState({
            showHeatmapColumns: showHeatmapColumns
        });
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

    handleIconClick: function(image, event) {
        // Might be a Dataset image OR a Well that is selected.
        let imageId = image.id;
        let wellId = image.wellId;
        if (wellId) {
            this.setSelectedWells([wellId]);
            return;
        }
        let jstree = this.props.jstree;
        let containerNode = OME.getTreeImageContainerBestGuess(imageId);

        let selIds = this.props.imgJson.filter(i => i.selected).map(i => i.id);
        let imgIds = this.props.imgJson.map(i => i.id);
        let clickedIndex = imgIds.indexOf(imageId);

        let toSelect = [];

        // handle shift
        if (event.shiftKey && selIds.length > 0) {
            // if any selected already, select range...
            let firstSelIndex = imgIds.indexOf(selIds[0]);
            let lastSelIndex = imgIds.indexOf(selIds[selIds.length - 1]);
            firstSelIndex = Math.min(firstSelIndex, clickedIndex);
            lastSelIndex = Math.max(lastSelIndex, clickedIndex);
            toSelect = imgIds.slice(firstSelIndex, lastSelIndex + 1);
        } else if (event.metaKey) {
            // handle Cmd -> toggle selection
            if (selIds.indexOf(imageId) === -1) {
                selIds.push(imageId)
                toSelect = selIds;
            } else {
                toSelect = selIds.filter(i => i !== imageId);
            }
        } else {
            // Only select clicked image
            toSelect = [imageId];
        }
        if (jstree) {
            jstree.deselect_all();
            let nodes = toSelect.map(iid => jstree.locate_node('image-' + iid, containerNode)[0]);
            jstree.select_node(nodes);
            // we also focus the node, so that hotkey events come from the node
            if (nodes.length > 0) {
                $("#" + nodes[0].id).children('.jstree-anchor').focus();
            }
        }
    },

    render() {
        let {imgJson, iconSize, tableData} = this.props;

        let columnNames = Object.keys(tableData);

        let dataRanges = columnNames.reduce((prev, name) => {
            let mn = Object.values(tableData[name]).reduce((p, v) => Math.min(p, v));
            let mx = Object.values(tableData[name]).reduce((p, v) => Math.max(p, v));
            prev[name] = [mn, mx]
            return prev;
        }, {});
        function heatMapColor(name, value) {
            let minMax = dataRanges[name];
            let fraction = (value - minMax[0])/(minMax[1] - minMax[0]);
            return getHeatmapColor(fraction);
        }

        return (
            <div className="parade_centrePanel">
                <table className="parade_dataTable">
                    <tbody>
                    <tr>
                        <td>Thumb</td>
                        <td>Name</td>
                        {columnNames.map(name => (
                            <td key={name}>
                                {name}
                                <input
                                    onClick={(event) => {this.handleShowHeatmap(event, name)}}
                                    type="checkbox"
                                    title="Show Heatmap"/>
                            </td>
                        ))}
                    </tr>
                    {imgJson.map(image => (
                        <tr key={image.id}>
                            <td>
                                <img alt="image"
                                    width={iconSize + "px"}
                                    height={iconSize + "px"}
                                    src={"/webgateway/render_thumbnail/" + image.id + "/"}
                                    title={image.name}
                                    onClick={event => {this.handleIconClick(image, event)}} />
                            </td>
                            <td>
                                {image.name}
                            </td>
                            {columnNames.map(name => (
                                <td key={name}
                                    style={{backgroundColor: this.state.showHeatmapColumns[name] ? heatMapColor(name, tableData[name][image.id]): 'transparent'}}
                                    >
                                    {tableData[name][image.id]}
                                </td>
                            ))}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        );
    }
});
