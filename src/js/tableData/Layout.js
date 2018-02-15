
import React, { Component } from 'react';
import FilterContainer from '../filter/FilterContainer';
import DataTable from './DataTable';
import PlateGrid from '../plate/PlateGrid';
import Dataset from '../dataset/Dataset';
import Footer from '../Footer';
import clusterfck from 'clusterfck';

export default React.createClass({

    getInitialState: function() {
        return {
            iconSize: 50,
            layout: "table",   // "icon" or "table"
            dataProviders: [],
            tableData: {},
        }
    },

    setIconSize: function(size) {
        this.setState({iconSize: parseInt(size, 10)});
    },

    setLayout: function(layout) {
        console.log(layout);
        this.setState({layout: layout});
    },

    componentDidMount: function() {
        // list available data providers (TODO: only for current data? e.g. plate)
        let url = window.PARADE_DATAPROVIDERS_URL;
        if (this.props.datasetId) url += '?dataset=' + this.props.datasetId;
        else if (this.props.plateId) url += '?plate=' + this.props.plateId;
        $.ajax({
            url: url,
            dataType: 'json',
            cache: false,
            success: function(data) {
                if (this.isMounted()) {
                    console.log(data);
                    this.setState({
                        dataProviders: data.data,
                    });
                }
            }.bind(this)
        });
    },

    handleAddData: function(event) {
        // When user chooses to ADD data by Name, load it...
        var dataName = event.target.value;
        if (dataName !== "--") {
            var url = window.PARADE_INDEX_URL + 'data/' + dataName;
            if (this.props.datasetId) url += '?dataset=' + this.props.datasetId;
            if (this.props.plateId) url += '?plate=' + this.props.plateId;
            if (this.props.fieldId !== undefined) url += '&field=' + this.props.fieldId;
            $.getJSON(url, data => {
                // Add data to table data
                let td = Object.assign({}, this.state.tableData);
                td[dataName] = data.data;
                this.setState({
                    tableData: td
                });
            });
        }
    },

    clusterTableData: function() {
        // make a list of data for each image from state.tableData
        // Each item of tableData is already a dict of {imageId: value}
        let dataKeys = Object.keys(this.state.tableData);
        if (dataKeys.length < 2) return;
        // make dict of {imageId: [v1, v2, v3]}.
        let imageIds = this.props.filteredImages.map(i => i.id);
        let toCluster = imageIds.map(iid => {
            return dataKeys.map(key => this.state.tableData[key][iid]);
        });
        // Make a lookup of tableDataKey :image_id so that when we get clustered tableDAta
        // we can work out which image each 'row' of data came from (since we can't
        // include image ID in the cluster data)
        // We know the 'toCluster' list is in same order as imageIDs just now...
        let clusterLookup = imageIds.reduce((prev, iid, index) => {
            let dataString = toCluster[index].join(",");
            prev[dataString] = iid;
            return prev;
        }, {});
        // let toCluster = [[255, 255, 240],
        //     [20, 120, 102],
        //     [250, 255, 253],
        //     [100, 54, 300]];
        let threshold = 25000;
        var clusters = clusterfck.hcluster(toCluster, clusterfck.EUCLIDEAN_DISTANCE,
            clusterfck.AVERAGE_LINKAGE, threshold);
        console.log(clusters);
        let orderedResults = this.traverseCluster(clusters);

        let orderedImageIds = orderedResults.map(res => clusterLookup[res.join(",")]);
        console.log('orderedImageIds', orderedImageIds);
        return orderedImageIds;
    },

    traverseCluster: function(clusters) {

        let out = [];
        function traverseNode(node) {
            console.log("traverse", node);
            if (node.left && node.right) {
                traverseNode(node.left);
                traverseNode(node.right);
            } else {
                out.push(node.value);
            }
        }
        clusters.forEach(n => {traverseNode(n)});
        console.log(out);
        return out;
    },

    render: function() {
        if (this.props.plateData === undefined && this.props.filteredImages === undefined) {
            return(<div></div>)
        }
        let orderedImageIds = this.clusterTableData();
        let filteredImages = this.props.filteredImages;
        if (orderedImageIds) {
            // sort filteredImages by ID...
            // create lookup {iid: image} 
            console.log("BEFORE CLUSTER", filteredImages.map(img => img.id));
            let imgLookup = filteredImages.reduce((prev, img) => {
                prev[img.id] = img;
                return prev;
            }, {});
            filteredImages = orderedImageIds.map(iid => imgLookup[iid]);
            console.log("AFTER CLUSTER", filteredImages.map(img => img.id));
        }
        let imageComponent;
        if (this.state.layout === "table") {
            imageComponent = (
                <DataTable
                    iconSize={this.state.iconSize}
                    imgJson={filteredImages}
                    jstree = {this.props.jstree}
                    tableData={this.state.tableData}
                    fieldId={this.props.fieldId}
                    />)
        } else if (this.props.plateData) {
            imageComponent = (
                <PlateGrid
                    iconSize={this.state.iconSize}
                    plateData={this.props.plateData}
                    filteredImages={filteredImages}
                    tableData={this.state.tableData}
                    fieldId={this.props.fieldId}
                    />)
        } else {
            imageComponent = (
                <Dataset
                    iconSize={this.state.iconSize}
                    imgJson={filteredImages}
                    jstree = {this.props.jstree}
                    />)
        }

        return(
                <div className="plateContainer">
                    <div className="layoutHeader">
                        <select defaultValue={"--"} onChange={this.handleAddData}>
                            <option
                                value="--" >
                                Add table data...
                            </option>
                            {this.state.dataProviders.map(function(n, i){
                                return (
                                    <option
                                        key={i}
                                        value={n}>
                                        {n}
                                    </option>
                                );
                            })}
                        </select>
                        <div className="layoutButton">
                            <button onClick={() => {this.setLayout("icon")}}>
                                grid
                            </button>
                            <button onClick={() => {this.setLayout("table")}}>
                                list
                            </button>
                        </div>
                    </div>
                    {imageComponent}
                    <Footer
                        iconSize={this.state.iconSize}
                        setIconSize={this.setIconSize} />
                </div>)
    }
});
