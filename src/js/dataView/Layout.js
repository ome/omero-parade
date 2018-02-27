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
import Dataset from './dataset/Dataset';
import PlateGrid from './plate/PlateGrid';
import DataPlot from './plot/DataPlot';
import DataTable from './table/DataTable';
import Footer from '../Footer';

export default React.createClass({

    getInitialState: function() {
        return {
            iconSize: 50,
            layout: "icon",   // "icon", "plot" or "table"
            dataProviders: [],
            tableData: {},
            selectedWellIds: [],
        }
    },

    setIconSize: function(size) {
        this.setState({iconSize: parseInt(size, 10)});
    },

    setLayout: function(layout) {
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

    handleImageWellClicked: function(obj, event) {
        // Might be a Dataset image OR a Well that is selected.
        let imageId = obj.id;
        let wellId = obj.wellId;
        if (wellId) {
            // TODO - handle Shift/Ctrl-click
            this.setSelectedWells([wellId]);
            return;
        }
        let selIds = this.props.filteredImages.filter(i => i.selected).map(i => i.id);
        let imgIds = this.props.filteredImages.map(i => i.id);
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
        this.props.setSelectedImages(toSelect);
    },

    setImagesWellsSelected: function(dtype, ids) {
        // Selected state of IMAGES is handled in jstree
        // Selected state of WELLS is handled by this.state 
        if (dtype === 'well') {
            this.setSelectedWells(ids);
        } else {
            this.props.setSelectedImages(ids);
        }
    },

    setSelectedWells: function(wellIds) {
        this.setState({selectedWellIds: wellIds});
        // Trigger loading Wells in right panel...
        var well_index = this.props.fieldId;
        var selected_objs = wellIds.map(wId => ({id: 'well-' + wId, index: this.props.fieldId}))
        $("body")
            .data("selected_objects.ome", selected_objs)
            .trigger("selection_change.ome");
        // Update the buttons above jstree as if nothing selected
        // (but don't actually change selection in jstree).
        if (buttonsShowHide) {
            buttonsShowHide([]);
        }
    },

    render: function() {
        if (this.props.plateData === undefined && this.props.filteredImages === undefined) {
            return(<div></div>)
        }
        let filteredImages = this.props.filteredImages;
        let imageComponent;
        if (this.state.layout === "table") {
            imageComponent = (
                <DataTable
                    iconSize={this.state.iconSize}
                    imgJson={filteredImages}
                    selectedWellIds={this.state.selectedWellIds}
                    handleImageWellClicked = {this.handleImageWellClicked}
                    setImagesWellsSelected = {this.setImagesWellsSelected}
                    tableData={this.state.tableData}
                    />)
        } else if (this.state.layout === "plot") {
            imageComponent = (
                <DataPlot
                    iconSize={this.state.iconSize}
                    imgJson={filteredImages}
                    tableData={this.state.tableData}
                    selectedWellIds={this.state.selectedWellIds}
                    handleImageWellClicked = {this.handleImageWellClicked}
                    setImagesWellsSelected = {this.setImagesWellsSelected}
                    />)
        } else if (this.props.plateData) {
            imageComponent = (
                <PlateGrid
                    iconSize={this.state.iconSize}
                    plateData={this.props.plateData}
                    filteredImages={filteredImages}
                    tableData={this.state.tableData}
                    selectedWellIds={this.state.selectedWellIds}
                    handleImageWellClicked = {this.handleImageWellClicked}
                    setImagesWellsSelected = {this.setImagesWellsSelected}
                    />)
        } else {
            imageComponent = (
                <Dataset
                    iconSize={this.state.iconSize}
                    imgJson={filteredImages}
                    handleImageWellClicked = {this.handleImageWellClicked}
                    setImagesWellsSelected = {this.setImagesWellsSelected}
                    />)
        }

        return(
                <div className="parade_layout_container">
                    <div className="layoutHeader">
                        <select value={"--"} onChange={this.handleAddData}>
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
                            <button onClick={() => {this.setLayout("plot")}}>
                                plot
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
