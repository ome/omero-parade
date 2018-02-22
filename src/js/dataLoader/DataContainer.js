
import React, { Component } from 'react';
import FieldsLoader from './plateLoader/FieldsLoader'
import DatasetContainer from './datasetLoader/DatasetContainer';


const DataContainer = React.createClass({

    setSelectedImages: function(imageIds) {
        let jstree = this.props.jstree;
        if (jstree) {
            jstree.deselect_all();
            if (imageIds.length === 0) return;
            let containerNode = OME.getTreeImageContainerBestGuess(imageIds[0]);
            let nodes = imageIds.map(iid => jstree.locate_node('image-' + iid, containerNode)[0]);
            jstree.select_node(nodes);
            // we also focus the node, so that hotkey events come from the node
            if (nodes.length > 0) {
                $("#" + nodes[0].id).children('.jstree-anchor').focus();
            }
        }
    },

    render: function() {
        var parentNode = this.props.parentNode;

        // If not loaded, show nothing (don't know how many children plate will have)
        if (!parentNode.state.loaded) {
            return (<h2 className="iconTable">Loading...</h2>);
        }

        // If plate has > 1 run, show nothing
        if (parentNode.type === "plate" && parentNode.children.length > 1) {
            return (<h2 className="iconTable">Select Run</h2>);
        }
        // key identifies the content of center panel. Plate or Run
        var key = parentNode.id;
        if (parentNode.type === "plate" && parentNode.children.length === 1) {
            // Children is list of node-ids
            key = parentNode.children[0];
        }
        // We pass key to <FieldsLoader> so that if key doesn't change,
        // Plate won't mount (load data) again
        var jstree = this.props.jstree;
        var parentId = parentNode.data.id;
        var dtype = parentNode.type;

        let rv = (<div>OOps {dtype}</div>);
        if (dtype == "plate" || dtype == "aquisition") {
            if (dtype == "acquisition") {
                parentId = jstree.get_node(jstree.get_parent(parentNode)).data.id;
            }

            rv = (
                <FieldsLoader
                    plateId={parentId}
                    parentNode={parentNode}
                    key={key}/>
            )
        }
        if (dtype === "dataset") {
            rv = (
                <DatasetContainer
                    jstree={jstree}
                    parentNode={parentNode}
                    setSelectedImages={this.setSelectedImages}/>
            )
        }
        return rv;
    }
});

export default DataContainer
