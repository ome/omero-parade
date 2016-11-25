
import React, { Component } from 'react';
import IconTableHeader from './IconTableHeader'
import IconTableHeadRow from './IconTableHeadRow'
import ImageIcon from './ImageIcon'

const styles = {
    thumbContainer: {
        position: 'absolute',
        bottom: 25,
        left: 0,
        top: 29,
        overflow: 'auto',
        marginTop: 0,
        right: 0,
    }
}

const Dataset = React.createClass({

    componentDidMount: function() {
        var inst = this.props.inst;
        $(this.refs.dataIcons).selectable({
            filter: 'li.row',
            distance: 2,
            stop: function() {
                // Make the same selection in the jstree etc
                $(".ui-selected").each(function(){
                    var imageId = $(this).attr('data-id');
                    var containerNode = OME.getTreeImageContainerBestGuess(imageId);
                    var selectedNode = inst.locate_node('image-' + imageId, containerNode)[0];
                    inst.select_node(selectedNode);
                });
            },
            start: function() {
                inst.deselect_all();
            }
        });
    },

    componentWillUnmount: function() {
        // cleanup plugin
        $(this.refs.dataIcons).selectable( "destroy" );
    },

    handleIconClick: function(imageId, event) {
        let inst = this.props.inst;
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
        inst.deselect_all();
        let nodes = toSelect.map(iid => inst.locate_node('image-' + iid, containerNode)[0]);
        inst.select_node(nodes);
        // we also focus the node, so that hotkey events come from the node
        if (nodes.length > 0) {
            $("#" + nodes[0].id).children('.jstree-anchor').focus();
        }
    },

    render() {
        let {imgJson, iconSize, filterText, setFilterText, layout, setLayout} = this.props;
        var ulStyle = layout === 'icon' ? {width: '100%', height: '100%'} : {};

        return (
            <div className="centrePanel">
                <IconTableHeader
                        filterText={filterText}
                        setFilterText={setFilterText}
                        layout={layout}
                        setLayout={setLayout} />
                <div style={styles.thumbContainer} >
                    <ul
                        ref="dataIcons"
                        style={ulStyle}
                        className={layout + "Layout"}>
                        <IconTableHeadRow />
                        {imgJson.map(image => (
                            <ImageIcon
                                image={image}
                                key={image.id}
                                iconSize={iconSize}
                                handleIconClick={this.handleIconClick} />
                        ))}
                    </ul>
                </div>
            </div>
        );
    }
});

export default Dataset
