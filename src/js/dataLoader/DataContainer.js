
import React, { Component } from 'react';
import FieldsLoader from './FieldsLoader'


const DataContainer = React.createClass({

    getInitialState: function() {
        return {
            iconSize: 65,
        }
    },

    setIconSize: function(size) {
        this.setState({iconSize: parseInt(size, 10)});
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
        var inst = this.props.inst;
        var plateId = parentNode.data.id;
        var dtype = parentNode.type;
        if (dtype === "acquisition") {
            plateId = inst.get_node(inst.get_parent(parentNode)).data.id;
        }

        return (
            <FieldsLoader
                plateId={plateId}
                parentNode={parentNode}
                iconSize={this.state.iconSize}
                setIconSize={this.setIconSize}
                key={key}/>
        )
    }
});

export default DataContainer
