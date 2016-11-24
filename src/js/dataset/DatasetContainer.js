
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


const DatasetContainer = React.createClass({

    getInitialState: function() {
        return {
            layout: 'icon',
            filterText: "",
        }
    },

    setLayout: function(layout) {
        this.setState({layout: layout});
    },

    setFilterText: function(filterText) {
        console.log("setFilterText", filterText);
        this.setState({filterText: filterText});
        setTimeout(this.deselectHiddenThumbs, 50);
    },

    deselectHiddenThumbs: function() {
        var imageIds = this._thumbsToDeselect;
        console.log("deselectHiddenThumbs", imageIds);

        if (imageIds.length === 0) {
            return;
        }
        var inst = this.props.inst;
        var containerNode = OME.getTreeImageContainerBestGuess(imageIds[0]);
        if (containerNode) {
            imageIds.forEach(function(iid){
                var selectedNode = inst.locate_node('image-' + iid, containerNode)[0];
                inst.deselect_node(selectedNode, true);
            });
        }
    },

    setThumbsToDeselect: function(imageIds) {
        this._thumbsToDeselect = imageIds;
    },

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
        var inst = this.props.inst;
        var containerNode = OME.getTreeImageContainerBestGuess(imageId);
        var selectedNode = inst.locate_node('image-' + imageId, containerNode)[0];

        // Deselect all to begin (supress jstree event)
        // inst.deselect_all(true);
        // inst.select_node(selectedNode, true);

        // Simply allow jstree to handle selection ranges etc by delegating
        // the event.
        // TODO: this fails when we have some thumbnails hidden (still get selected in range)
        // TODO: Also fails if Dataset node is collapsed.
        var keys = {
            shiftKey: event.shiftKey,
            metaKey: event.metaKey
        }
        $("#" + selectedNode.id + ">a").trigger($.Event('click', keys));
    },

    marshalNode: function(node) {
        var parentNode = this.props.parentNode;
        var dateFormatOptions = {
            weekday: "short", year: "numeric", month: "short",
            day: "numeric", hour: "2-digit", minute: "2-digit"
        };
        var d = node.data.obj.date || node.data.obj.acqDate;
        var date = new Date(d);
        date = date.toLocaleTimeString(undefined, dateFormatOptions);
        var iData = {'id': node.data.obj.id,
            'name': node.text,
            'data': JSON.parse(JSON.stringify(node.data)),
            'selected': node.state.selected,
            'date': date,
        };
        // If image is in share and share is not owned by user...
        if (node.data.obj.shareId && !parentNode.data.obj.isOwned) {
            // share ID will be needed to open image viewer
            iData.shareId = node.data.obj.shareId;
        }
        // Thumb version: random to break cache if thumbnails are -1 'in progress'
        // or we're refreshing 1 or all thumbnails
        // if (node.data.obj.thumbVersion != undefined ||
        //         event.type === "refreshThumbnails" ||
        //         event.type === "refreshThumb") {
        //     var thumbVersion = node.data.obj.thumbVersion;
        //     if (thumbVersion === -1 || event.type === "refreshThumbnails" || (
        //             event.type === "refreshThumb" && data.imageId === iData.id)) {
        //         thumbVersion = getRandom();
        //         // We cache this to prevent new thumbnails requested on every
        //         // selection change. Refreshing of tree will reset thumbVersion.
        //         node.data.obj.thumbVersion = thumbVersion;
        //     }
        //     iData.thumbVersion = thumbVersion;
        // }
        return iData;
    },

    getImageNodes: function() {
        let imgNodes = [],
            inst = this.props.inst;

        this.props.parentNode.children.forEach(function(ch){
            var childNode = inst.get_node(ch);
            // Ignore non-images under tags or 'deleted' under shares
            if (childNode.type == "image") {
                imgNodes.push(childNode);
            }
        });
        return imgNodes;
    },

    render: function() {
        var imgNodes = this.getImageNodes();
        var fltr = this.state.filterText;

        // Convert jsTree nodes into json for template
        let imgJson = imgNodes.map(this.marshalNode);

        let thumbsToDeselect = [];
        if (fltr.length > 0) {
            // find hidden images we need to de-select in jstree
            thumbsToDeselect = imgJson.filter(i => i.name.indexOf(fltr) === -1 && i.selected)
                                      .map(i => i.id);
            // filter images
            imgJson = imgJson.filter(i => i.name.indexOf(fltr) !== -1);
        }

        // Let parent know that some aren't shown
        this.setThumbsToDeselect(thumbsToDeselect);

        // Get selected filesets...
        let selFileSets = imgJson.filter(i => i.selected).map(i => i.data.obj.filesetId);
        // ...go through all images, adding fs-selection flag if in selected fileset
        if (selFileSets.length > 0) {
            imgJson.forEach(function(img){
                if (selFileSets.indexOf(img.data.obj.filesetId) > -1) {
                    img.fsSelected = true;
                }
            });
        }

        var icons = imgJson.map(function(image){
            return (
                <ImageIcon
                    image={image}
                    key={image.id}
                    iconSize={this.props.iconSize}
                    handleIconClick={this.handleIconClick} />
            );
        }.bind(this));

        return (
        <div className="centrePanel">
            <IconTableHeader
                    filterText={this.state.filterText}
                    setFilterText={this.setFilterText}
                    layout={this.state.layout}
                    setLayout={this.setLayout} />
            <div style={styles.thumbContainer} >
                <ul
                    ref="dataIcons"
                    className={this.state.layout + "Layout"}>
                    <IconTableHeadRow />
                    {icons}
                </ul>
            </div>
        </div>);
    }
});

export default DatasetContainer
