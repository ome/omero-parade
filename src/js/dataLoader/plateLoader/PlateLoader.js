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
import CircularProgress from 'material-ui/CircularProgress';
import _ from 'lodash';
import axios from 'axios';

import FilterHub from '../../filter/FilterHub';
import config from '../../config';

class PlateLoader extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            fields: {},
            plateData: [],
            selectedWellIds: [],
        }
        this.failureCallback = this.failureCallback.bind(this);
        this.fieldDataSuccessCallback = this.fieldDataSuccessCallback.bind(this);
        this.plateDataSuccessCallback = this.plateDataSuccessCallback.bind(this);
    }

    loadFieldData() {
        return Promise.all(this.props.treeOpenNodes.map((treeOpenNode) => {
            const elements = ["api/fields", treeOpenNode.data.id, ""];
            return axios.get(config.indexUrl + elements.join("/"), {
                cancelToken: this.source.token
            }).then(this.fieldDataSuccessCallback, this.failureCallback);
        }));
    }

    fieldDataSuccessCallback(response) {
        this.setState(prevState => {
            const fields = prevState.fields;
            fields[response.data.plateId] = response.data.data;
            return {fields: fields};
        });
    }

    failureCallback(thrown) {
        if (axios.isCancel(thrown)) {
            throw thrown;
        }
        // TODO: Put this error somewhere "correct"
        console.log("Error loading data!", thrown);
    }

    loadPlateData() {
        // Parent component enforces that there will only be one selected node
        const selectedNode = this.props.treeSelectedNodes[0];

        let nodes = this.props.treeOpenNodes;
        let fieldId = 0;
        if (selectedNode.type === "plate") {
            nodes = [selectedNode];
        }
        if (selectedNode.type === "acquisition") {
            const plateNode = this.props.jstree.get_node(selectedNode.parent);
            nodes = [plateNode];
            fieldId = _.min(
                this.state.fields[plateNode.data.id]
                    .filter(v => v[1] === selectedNode.data.id)
                    .map(v => v[0])
            );
        }
        const plateIds = nodes.map(v => v.data.id);
        return Promise.all(nodes.map((node) => {
            const elements = ["plate", node.data.id, fieldId, ""];
            return axios.get(config.webgatewayBaseUrl + elements.join("/"), {
                cancelToken: this.source.token,
                fieldId: fieldId,
                plateIds: plateIds,
                plateNode: node
            }).then(this.plateDataSuccessCallback, this.failureCallback);
        }));
    }

    plateDataSuccessCallback(response) {
        this.setState(prevState => {
            const plateData = prevState.plateData;
            const plateNode = response.config.plateNode;
            const plateIds = response.config.plateIds;
            const plateId = plateNode.data.id;
            plateData[plateIds.indexOf(plateId)] = Object.assign(
                response.data, {
                    fieldId: response.config.fieldId,
                    plateId: plateId,
                    plateName: plateNode.data.obj.name
                }
            );
            return {plateData: plateData};
        });
    }

    loadData() {
        if (this.props.treeOpenNodes.length < 1) {
            return;
        }
        this.setState({
            fields: {},
            plateData: [],
            selectedWellIds: [],
            loading: true
        });
        this.loadFieldData().then(
            () => {
                this.loadPlateData();
            },
            (thrown) => {
                if (axios.isCancel(thrown)) {
                    throw thrown;
                }
                this.setState({loading: false});
            }
        ).then(
            () => {
                this.setState({loading: false});
            },
            (thrown) => {
                if (axios.isCancel(thrown)) {
                    return;
                }
                this.setState({loading: false});
            }
        );
    }

    componentDidMount() {
        const CancelToken = axios.CancelToken;
        this.source = CancelToken.source();
        this.loadData();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const prevTreeOpenNodes = prevProps.treeOpenNodes.map(v => v.id);
        const treeOpenNodes = this.props.treeOpenNodes.map(v => v.id);
        const treeSelectedNodes = this.props.treeSelectedNodes.map(v => v.id);
        const prevTreeSelectedNodes =
            prevProps.treeSelectedNodes.map(v => v.id);
        if (!_.isEqual(treeOpenNodes, prevTreeOpenNodes)
                || !_.isEqual(treeSelectedNodes, prevTreeSelectedNodes)) {
            this.loadData();
        }
    }

    componentWillUnmount() {
        if (this.source) {
            this.source.cancel();
        }
    }

    render() {
        if (this.props.treeOpenNodes.length < 1) {
            return(<div></div>)
        }

        // Generate a list of all images for each plate from a flattened grid.
        const images = this.state.plateData
                .map(v => v.grid)
                .reduce((a, b) => a.concat(b), [])  // Flatten each grid
                .map(row => row.filter(column => column !== null))
                .reduce((a, b) => a.concat(b), []);  // Flatten each row
        if (this.state.loading) {
            return <div>
                <CircularProgress color="#5e656e" size={12} /><span>Loading...</span>
            </div>
        }
        return (<FilterHub
                    images={images}
                    parentType={this.props.effectiveRootNode.type}
                    parentId={this.props.effectiveRootNode.data.id}
                    plateData={this.state.plateData}
                    thumbnailLoader={this.props.thumbnailLoader}
                />)
    }
}

export default PlateLoader
