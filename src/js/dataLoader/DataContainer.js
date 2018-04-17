//
// Copyright (C) 2018 University of Dundee & Open Microscopy Environment.
// All rights reserved.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.
//

import React, { Component } from 'react';
import FieldsLoader from './plateLoader/FieldsLoader'
import DatasetContainer from './datasetLoader/DatasetContainer';


class DataContainer extends React.Component {

    static get ROOT_NODE_TYPES() {
        return [
            "project",
            "dataset",
            "orphaned",
            "tag",
            "share",
            "screen",
            "plate",
            "acquisition"
        ]
    }

    constructor(props) {
        super(props);
        const jstree = this.props.jstree;
        const treeSelectedNodes = jstree.get_selected(true);
        const treeRootNodes = this.getRootNodes(treeSelectedNodes);
        const effectiveRootNode =
            this.getEffectiveRootNode(treeRootNodes, treeSelectedNodes);
        const treeOpenNodes =
            this.getOpenNodes(treeSelectedNodes, effectiveRootNode);
        this.state = {
            treeSelectedNodes: treeSelectedNodes,
            treeRootNodes: treeRootNodes,
            effectiveRootNode: effectiveRootNode,
            treeOpenNodes: treeOpenNodes
        }
        $("#dataTree")
            .on('select_node.jstree', null, this, this.onJsTreeSelectNode)
            .on('open_node.jstree', null, this, this.onJsTreeOpenCloseNode)
            .on('close_node.jstree', null, this, this.onJsTreeOpenCloseNode);

        this.setSelectedImages = this.setSelectedImages.bind(this);
    }

    /**
     * Called whenever a 'select_node.jstree' event is fired by the jsTree
     * instance on the page.  This is a jQuery event handler so has slightly
     * different semantics than if it were a React one.
     * @see https://www.jstree.com/api/#/?q=.jstree%20Event
     */
    onJsTreeSelectNode(event, node, selected, triggerEvent) {
        // As this is a jQuery integration, "this" will be the jQuery context
        // for the event handler.  We have passed the "DataContainer" along
        // as event data.
        const _this = event.data;
        const jstree = _this.props.jstree;
        const treeSelectedNodes = jstree.get_selected(true);
        const treeRootNodes = _this.getRootNodes(treeSelectedNodes);
        const effectiveRootNode =
            _this.getEffectiveRootNode(treeRootNodes, treeSelectedNodes);
        const treeOpenNodes =
            _this.getOpenNodes(treeSelectedNodes, effectiveRootNode);

        _this.setState({
            treeSelectedNodes: treeSelectedNodes,
            treeRootNodes: treeRootNodes,
            effectiveRootNode: effectiveRootNode,
            treeOpenNodes: treeOpenNodes
        });
    }

    /**
     * Called whenever a 'open_node.jstree' or 'close_node.jstree' event is
     * fired by the jsTree instance on the page.  This is a jQuery event
     * handler so has slightly different semantics than if it were a React
     * one.
     * @see https://www.jstree.com/api/#/?q=.jstree%20Event
     */
    onJsTreeOpenCloseNode(event, node) {
        // As this is a jQuery integration, "this" will be the jQuery context
        // for the event handler.  We have passed the "DataContainer" along
        // as event data.
        const _this = event.data;
        _this.setState((prevState, props) => {
            return {
                treeOpenNodes: _this.getOpenNodes(
                    prevState.treeSelectedNodes, prevState.effectiveRootNode
                )
            }
        })
    }

    /**
     * From a set of selected jsTree nodes return a corresponding array of
     * root nodes.
     */
    getRootNodes(selectedNodes) {
        const jstree = this.props.jstree;
        return selectedNodes.map(v => {
            let treeRootNode = v;
            let parentNode = treeRootNode;
            while (parentNode.type !== "experimenter") {
                treeRootNode = parentNode;
                parentNode = jstree.get_node(
                    jstree.get_parent(treeRootNode.id)
                );
            }
            return treeRootNode;
        });
    }

    /**
     * From a set of selected and root jsTree nodes return the single
     * effective root node.  The set of supported root node types is
     * defined by <code>ROOT_NODE_TYPES</code>, all selected nodes must
     * be of the same type, and either one node must be selected or
     * <strong>only</strong> images must be selected.
     *
     * If any of these conditions are not met the effective root node is
     * undefined.
     */
    getEffectiveRootNode(rootNodes, selectedNodes) {
        if (rootNodes.length < 1) {
            return;
        }
        const effectiveRoot = rootNodes[0];

        // There are a limited set of supported root node types
        if (!DataContainer.ROOT_NODE_TYPES.includes(effectiveRoot.type)) {
            return;
        }
        // The root node for all selected nodes must be the same
        for (let rootNode of rootNodes) {
            if (effectiveRoot.id !== rootNode.id) {
                return;
            }
        }
        // There must be either one selected node or all nodes must be
        // of "image" type
        if (selectedNodes.length > 1) {
            for (let selectedNode of selectedNodes) {
                if (selectedNode.type !== "image") {
                    return;
                }
            }
        }

        return effectiveRoot;
    }

    /**
     * From a set of selected and effective root jsTree nodes return the
     * array of open jsTree nodes under that effective root.
     */
    getOpenNodes(treeSelectedNodes, effectiveRootNode) {
        const jstree = this.props.jstree;
        if (effectiveRootNode) {
            // When our root is a Project, the open nodes are all its
            // children (Datasets) which are open.
            if (effectiveRootNode.type === "project") {
                return effectiveRootNode.children.filter(
                    child => jstree.is_open(child)
                ).map(v => jstree.get_node(v));
            }
            // When our root is a Dataset, it is what is open.
            if (effectiveRootNode.type === "dataset") {
                return [effectiveRootNode];
            }
            // When our root is a Screen or a Plate the effective root will
            // only be defined if a single Screen, Plate or PlateAcquisition
            // is selected.
            if (["screen", "plate"].includes(effectiveRootNode.type)) {
                let selectedNode = treeSelectedNodes[0];
                if (selectedNode.type === "plate") {
                    return [selectedNode];
                }
                if (selectedNode.type === "acquisition") {
                    return [jstree.get_node(
                        jstree.get_parent(selectedNode.id)
                    )];
                }
            }
        }
        return [];
    }

    setSelectedImages(imageIds) {
        let jstree = this.props.jstree;
        if (jstree) {
            jstree.deselect_all();
            if (imageIds.length === 0) return;
            let containerNode = OME.getTreeImageContainerBestGuess(imageIds[0]);
            let nodes = imageIds.map(iid => {
                let containerNode = OME.getTreeImageContainerBestGuess(iid);
                return jstree.locate_node('image-' + iid, containerNode)[0]
            });
            jstree.select_node(nodes);
            // we also focus the node, so that hotkey events come from the node
            if (nodes.length > 0) {
                $("#" + nodes[0].id).children('.jstree-anchor').focus();
            }
        }
    }

    render() {
        const jstree = this.props.jstree;
        const effectiveRootNode = this.state.effectiveRootNode;

        // If we have no effective root node, show nothing
        if (!effectiveRootNode) {
            return (
                <div></div>
            );
        }
        // If plate has > 1 run, show nothing
        if (effectiveRootNode.type === "plate"
                && effectiveRootNode.children.length > 1) {
            return (<h2 className="iconTable">Select Run</h2>);
        }
        // If Project has no open Datasets, offer to open them all
        if (effectiveRootNode.type === "project") {
            if (this.state.treeOpenNodes.length < 1) {
                return (
                    <div className="parade_openAll">
                        <h1>No open Datasets</h1>
                        <button
                            onClick={() => {
                                jstree.open_all(
                                    effectiveRootNode.id
                                )
                            }}>
                            Open All
                        </button>
                    </div>
                );
            }
        }

        if (effectiveRootNode.type === "screen"
                || effectiveRootNode.type === "plate") {
            return (
                <FieldsLoader
                    treeSelectedNodes={this.state.treeSelectedNodes}
                    treeOpenNodes={this.state.treeOpenNodes}
                    effectiveRootNode={this.state.effectiveRootNode}/>
            )
        }
        if (effectiveRootNode.type === "project"
                || effectiveRootNode.type === "dataset") {
            return (
                <DatasetContainer
                    jstree={jstree}
                    treeOpenNodes={this.state.treeOpenNodes}
                    effectiveRootNode={this.state.effectiveRootNode}
                    setSelectedImages={this.setSelectedImages}/>
            )
        }
        return (<div>Oops {effectiveRootNode.type}</div>);
    }
}

export default DataContainer
