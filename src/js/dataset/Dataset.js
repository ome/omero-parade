
import React, { Component } from 'react';
import IconTableHeader from './IconTableHeader'
import IconTableHeadRow from './IconTableHeadRow'
import ImageIcon from './ImageIcon'
import Footer from '../Footer'

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
                    jstree.select_node(selectedNode);
                });
            },
            start: function() {
                jstree.deselect_all();
            }
        });
    },

    componentWillUnmount: function() {
        // cleanup plugin
        $(this.refs.dataIcons).selectable( "destroy" );
    },

    handleIconClick: function(imageId, event) {
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
        jstree.deselect_all();
        let nodes = toSelect.map(iid => jstree.locate_node('image-' + iid, containerNode)[0]);
        jstree.select_node(nodes);
        // we also focus the node, so that hotkey events come from the node
        if (nodes.length > 0) {
            $("#" + nodes[0].id).children('.jstree-anchor').focus();
        }
    },

    render() {
        let {imgJson, iconSize, setIconSize, 
             filterText, setFilterText, layout, setLayout} = this.props;
        var ulStyle = layout === 'icon' ? {width: '100%', height: '100%'} : {};

        return (
            <div>
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
                <Footer
                    iconSize={iconSize}
                    setIconSize={setIconSize} />
            </div>
        );
    }
});

export default Dataset
