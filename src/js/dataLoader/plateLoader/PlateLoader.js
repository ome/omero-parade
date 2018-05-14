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
import axios from 'axios';

import FilterHub from '../../filter/FilterHub';
import config from '../../config';

class PlateLoader extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            fields: [],
            selectedField: undefined,
            data: undefined,
            selectedWellIds: [],
        }
        this.failureCallback = this.failureCallback.bind(this);
        this.fieldDataSuccessCallback = this.fieldDataSuccessCallback.bind(this);
        this.plateDataSuccessCallback = this.plateDataSuccessCallback.bind(this);
    }

    loadFieldData() {
        // Parent component enforces that there will only be one selected node
        const selectedNode = this.props.treeSelectedNodes[0];
        let data;
        if (selectedNode.type === "plate") {
            data = {'plate': selectedNode.data.id}
        } else if (selectedNode.type === "acquisition") {
            // select 'run', load plate...
            data = {'run': selectedNode.data.id};
        } else {
            return;
        }
        return axios.get(config.indexUrl + "api/fields/", {
            cancelToken: this.source.token,
            params: data
        }).then(this.fieldDataSuccessCallback, this.failureCallback);
    }

    fieldDataSuccessCallback(response) {
        this.setState({
            fields: response.data.data,
            selectedField: response.data.data[0]
        });
    }

    failureCallback(thrown) {
        if (axios.isCancel(thrown)) {
            return;
        }
        // TODO: Put this error somewhere "correct"
        console.log("Error loading data!", thrown);
    }

    loadPlateData() {
        // Parent component enforces that there will only be one open node and
        // it will always be of "plate" type
        const plateNode = this.props.treeOpenNodes[0];
        const elements = [
            "plate", plateNode.data.id, this.state.selectedField, ""
        ];
        return axios.get(config.webgatewayBaseUrl + elements.join("/"), {
            cancelToken: this.source.token,
        }).then(this.plateDataSuccessCallback, this.failureCallback);
    }

    plateDataSuccessCallback(response) {
        this.setState({
            data: response.data,
        });
    }

    loadData() {
        if (this.props.treeOpenNodes.length < 1) {
            return;
        }

        const CancelToken = axios.CancelToken;
        this.source = CancelToken.source();
        this.loadFieldData().then(() => {
            this.loadPlateData();
        });
    }

    componentDidMount() {
        this.loadData();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        // Parent component enforces that there will only be one open node and
        // it will always be of "plate" type
        const plateNode = this.props.treeOpenNodes[0];
        const plateId = plateNode? plateNode.data.id : -1;
        const prevPlateNode = prevProps.treeOpenNodes[0];
        const prevPlateId = prevPlateNode? prevPlateNode.data.id : -1;
        if (plateId !== prevPlateId) {
            this.loadData();
        }
    }

    componentWillUnmount() {
        if (this.source) {
            this.source.cancel();
        }
    }

    render() {
        // Parent component enforces that there will only be one open node and
        // it will always be of "plate" type
        const plateNode = this.props.treeOpenNodes[0];

        if (plateNode === undefined
                || this.state.selectedField === undefined) {
            return(<div></div>)
        }

        let filteredImageIds;

        // Use filter state to filter data.
        // Pass filteredImageIds down to PlateGrid
        let images = [];
        if (this.state.data) {
            this.state.data.grid.forEach(row => {
                row.forEach(col => {
                    // TODO: 
                    if (col) images.push(col);
                });
            });
        }

        return(<FilterHub
                    images={images}
                    parentType={"plate"}
                    parentId={plateNode.data.id}
                    fieldId={this.state.selectedField}
                    plateData={this.state.data}
                    thumbnailLoader={this.props.thumbnailLoader}
                />)
    }
}

export default PlateLoader
