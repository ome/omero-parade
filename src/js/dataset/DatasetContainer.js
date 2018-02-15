
import React, { Component } from 'react';
import Dataset from './Dataset'
import FilterHub from '../filter/FilterHub'


const DatasetContainer = React.createClass({

    deselectHiddenThumbs: function() {
        var imageIds = this._thumbsToDeselect;
        if (imageIds.length === 0) {
            return;
        }
        var jstree = this.props.jstree;
        var containerNode = OME.getTreeImageContainerBestGuess(imageIds[0]);
        if (containerNode) {
            imageIds.forEach(function(iid){
                var selectedNode = jstree.locate_node('image-' + iid, containerNode)[0];
                jstree.deselect_node(selectedNode, true);
            });
        }
    },

    setThumbsToDeselect: function(imageIds) {
        this._thumbsToDeselect = imageIds;
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
            jstree = this.props.jstree;

        this.props.parentNode.children.forEach(function(ch){
            var childNode = jstree.get_node(ch);
            // Ignore non-images under tags or 'deleted' under shares
            if (childNode.type == "image") {
                imgNodes.push(childNode);
            }
        });
        return imgNodes;
    },

    render: function() {
        var imgNodes = this.getImageNodes();

        // Convert jsTree nodes into json for template
        let imgJson = imgNodes.map(this.marshalNode);

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

        return (<FilterHub
                datasetId={this.props.parentNode.data.obj.id}
                jstree = {this.props.jstree}
                images={imgJson}
            />)
    }
});

export default DatasetContainer
