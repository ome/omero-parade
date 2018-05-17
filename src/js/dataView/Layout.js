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
import FlatButton from 'material-ui/FlatButton';
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import ArrowDropRight from 'material-ui/svg-icons/navigation-arrow-drop-right';
import _ from 'lodash'
import axios from 'axios';
import qs from 'qs';

import Dataset from './dataset/Dataset';
import PlateGrid from './plate/PlateGrid';
import DataPlot from './plot/DataPlot';
import Tables from './table/Tables';
import Progress from '../filter/Progress';
import Footer from '../Footer';
import config from '../config';

class Layout extends React.Component {

    static get ONE_X_ONE_TRANSPARENT() {
        return "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==";
    }

    constructor(props) {
        super(props);
        const isSPW = this.props.plateData !== undefined;
        const showThumbnails = isSPW? false : true;
        this.state = {
            iconSize: 50,
            imageComponentViewMode: "Normal",
            layout: "icon",   // "icon", "plot" or "table"
            dataProviders: [],
            tableData: {},
            selectedWellIds: [],
            showDatasets: true,
            showThumbnails: showThumbnails,
            thumbnails: {},
            menuOpen: false,
        }
        this.setIconSize = this.setIconSize.bind(this);
        this.toggleShowDatasets = this.toggleShowDatasets.bind(this);
        this.toggleShowThumbnails = this.toggleShowThumbnails.bind(this);
        this.menuOnRequestClose = this.menuOnRequestClose.bind(this);
        this.menuOnClick = this.menuOnClick.bind(this);
        this.handleAddData = this.handleAddData.bind(this);
        this.handleImageWellClicked = this.handleImageWellClicked.bind(this);
        this.setImagesWellsSelected = this.setImagesWellsSelected.bind(this);
    }

    setIconSize(size) {
        this.setState({iconSize: parseInt(size, 10)});
    }

    setLayout(layout) {
        this.setState({layout: layout});
    }

    toggleShowDatasets(event) {
        this.setState(prevState => {
            return {showDatasets: !prevState.showDatasets};
        });
    }

    toggleShowThumbnails(event) {
        this.setState(prevState => {
            return {showThumbnails: !prevState.showThumbnails};
        });
    }

    menuOnClick(event) {
        // Prevents ghost click
        event.preventDefault();

        this.setState({
            menuOpen: true,
            anchorEl: event.currentTarget
        });
    }

    menuOnRequestClose() {
        this.setState({
            menuOpen: false
        });
    }

    loadThumbnails() {
        const imageIds = this.props.filteredImages.map(v => v.id)
            .filter(v => !this.state.thumbnails[v]);
        if (imageIds.length < 1) {
            return;
        }
        this.props.thumbnailLoader.getThumbnails(imageIds, (response) => {
            this.setState(prevState => {
                let thumbnails = prevState.thumbnails;
                for (const imageId in response.data) {
                    thumbnails[imageId] = response.data[imageId];
                }
                return {thumbnails: thumbnails};
            });
        }, (thrown) => {
            if (axios.isCancel(thrown)) {
                return;
            }
            // TODO: Put this error somewhere "correct"
            console.log("Error loading thumbnails!", thrown);
        }, this.source.token);
    }

    componentDidMount() {
        const CancelToken = axios.CancelToken;
        this.source = CancelToken.source();

        let params = {};
        if (this.props.parentType === "project") {
            params = {project: this.props.parentId};
        }
        if (this.props.parentType === "dataset") {
            params = {dataset: this.props.parentId};
        }
        if (this.props.parentType === "screen") {
            params = {screen: this.props.parentId};
        }
        if (this.props.parentType === "plate") {
            params = {plate: this.props.parentId};
        }
        this.setState({
            loading: true
        });
        axios.get(config.dataprovidersUrl, {
            cancelToken: this.source.token,
            params: params
        }).then(
            (response) => {
                this.setState({
                    dataProviders: response.data.data,
                    loading: false
                });
            },
            (thrown) => {
                if (axios.isCancel(thrown)) {
                    return;
                }
                this.setState({
                    loading: false
                });
                // TODO: Put this error somewhere "correct"
                console.log("Error loading filters!", thrown);
            }
        );
        if (this.state.showThumbnails) {
            this.loadThumbnails();
        }
    }

    componentWillUnmount() {
        if (this.source) {
            this.source.cancel();
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const imageIds = this.props.filteredImages.map(v => v.id);
        const prevImageIds = prevProps.filteredImages.map(v => v.id);
        const showThumbnails = this.state.showThumbnails;
        const prevShowThumbnails = prevState.showThumbnails;
        if ((!_.isEqual(imageIds, prevImageIds)
                || (showThumbnails !== prevShowThumbnails))
                    && this.state.showThumbnails) {
            this.loadThumbnails();
        }
    }

    handleAddData(event) {
        // When user chooses to ADD data by Name, load it...
        const dataName = event.target.value;
        if (dataName === "--") {
            return;
        }

        let params = {image: this.props.filteredImages.map(v => v.id)};
        if (this.props.parentType === "screen") {
            params = {screen: this.props.parentId};
        }
        if (this.props.parentType === "plate") {
            const plateId = this.props.parentId;
            const fieldId = this.props.plateData.find(
                v => v.plateId === plateId
            ).fieldId;
            params = {
                plate: plateId,
                field: fieldId
            }
        }
        if (this.props.parentType === "dataset") {
            params = {
                dataset: this.props.parentId
            }
        }
        if (this.props.parentType === "project") {
            params = {
                project: this.props.parentId
            }
        }
        this.setState({
            loading: true
        });
        axios.get(config.indexUrl + 'data/' + btoa(dataName), {
            cancelToken: this.source.token,
            params: params,
            paramsSerializer: params => (
                qs.stringify(params, { indices: false })
            )
        }).then(
            (response) => {
                // Add data to table data
                let td = Object.assign({}, this.state.tableData);
                td[dataName] = response.data;
                this.setState({
                    loading: false,
                    tableData: td
                });
            },
            (thrown) => {
                if (axios.isCancel(thrown)) {
                    return;
                }
                this.setState({
                    loading: false
                });
                // TODO: Put this error somewhere "correct"
                console.log("Error loading filters!", thrown);
            }
        );
    }

    handleImageWellClicked(obj, event) {
        // Might be a Dataset image OR a Well that is selected.
        const imageId = obj.id;
        const wellId = obj.wellId;
        if (wellId) {
            // TODO - handle Shift/Ctrl-click
            this.setSelectedWells([obj]);
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
    }

    setImagesWellsSelected(dtype, images) {
        // Selected state of IMAGES is handled in jstree
        // Selected state of WELLS is handled by this.state 
        if (dtype === 'well') {
            this.setSelectedWells(images);
        } else {
            this.props.setSelectedImages(images.map(v => v.id));
        }
    }

    setSelectedWells(images) {
        this.setState({selectedWellIds: images.map(v => v.wellId)});
        // Trigger loading Wells in right panel...
        const selected_objs = images.map(
            v => ({id: 'well-' + v.wellId, index: v.field})
        );
        $("body")
            .data("selected_objects.ome", selected_objs)
            .trigger("selection_change.ome");
        // Update the buttons above jstree as if nothing selected
        // (but don't actually change selection in jstree).
        if (buttonsShowHide) {
            buttonsShowHide([]);
        }
    }

    renderHeatmapMenuItems() {
        if (Object.keys(this.state.tableData).length < 1) {
            return null;
        }
        return Object.entries(this.state.tableData).map(entry => {
            const [name, tableData] = entry;
            const checked = name === this.state.heatmapTableData;
            return (
                <MenuItem
                    insetChildren={true}
                    primaryText={name}
                    checked={checked}
                    onClick={(event) => {
                        this.setState({
                            imageComponentViewMode: "Heatmap",
                            heatmapTableData: name
                        });
                    }}
                />
            );
        })
    }

    renderSettingsMenu() {
        const heatmapMenuItems = this.renderHeatmapMenuItems();
        const modeMenuItems = [
            <MenuItem
                insetChildren={true}
                primaryText="Normal"
                checked={this.state.imageComponentViewMode === "Normal"}
                onClick={(event) => {
                    this.setState({
                        imageComponentViewMode: "Normal",
                        heatmapTableData: undefined
                    });
                }}
            />,
            <MenuItem
                insetChildren={true}
                primaryText="Heatmap"
                rightIcon={<ArrowDropRight />}
                checked={this.state.imageComponentViewMode === "Heatmap"}
                disabled={!heatmapMenuItems}
                menuItems={heatmapMenuItems}
            />,
        ];
        const viewMenuItems = [
            <MenuItem
                insetChildren={true}
                primaryText="Dataset"
                checked={this.state.showDatasets}
                onClick={this.toggleShowDatasets}
            />,
            <MenuItem
                insetChildren={true}
                primaryText="Thumbnails"
                checked={this.state.showThumbnails}
                onClick={this.toggleShowThumbnails}
            />,
        ];
        return <Menu desktop={true}>
            <MenuItem
                primaryText="Mode"
                rightIcon={<ArrowDropRight />}
                menuItems={modeMenuItems}
            />
            <MenuItem
                primaryText="View"
                rightIcon={<ArrowDropRight />}
                menuItems={viewMenuItems}
            />
        </Menu>
    }

    render() {
        if (this.props.plateData === undefined
                && this.props.filteredImages === undefined) {
            return(<div></div>)
        }
        let filteredImages = this.props.filteredImages;
        let imageComponent;
        let thumbnails = this.state.thumbnails;
        if (!this.state.showThumbnails
                || this.state.imageComponentViewMode === "Heatmap") {
            thumbnails = {};
            filteredImages.forEach(v => {
                thumbnails[v.id] = Layout.ONE_X_ONE_TRANSPARENT
            });
        }
        if (this.state.layout === "table") {
            imageComponent = (
                <Tables
                    iconSize={this.state.iconSize}
                    imgJson={filteredImages}
                    selectedWellIds={this.state.selectedWellIds}
                    showDatasets={this.state.showDatasets}
                    handleImageWellClicked = {this.handleImageWellClicked}
                    setImagesWellsSelected = {this.setImagesWellsSelected}
                    tableData={this.state.tableData}
                    thumbnails={thumbnails}
                    heatmapTableData={this.state.heatmapTableData}
                    viewMode={this.state.imageComponentViewMode}
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
                    thumbnails={thumbnails}
                    heatmapTableData={this.state.heatmapTableData}
                    viewMode={this.state.imageComponentViewMode}
                    />)
        } else if (this.props.plateData) {
            imageComponent = (
                <PlateGrid
                    iconSize={this.state.iconSize}
                    plateData={this.props.plateData}
                    filteredImages={filteredImages}
                    tableData={this.state.tableData}
                    selectedWellIds={this.state.selectedWellIds}
                    handleImageWellClicked={this.handleImageWellClicked}
                    setImagesWellsSelected={this.setImagesWellsSelected}
                    thumbnails={thumbnails}
                    heatmapTableData={this.state.heatmapTableData}
                    viewMode={this.state.imageComponentViewMode}
                    />)
        } else {
            imageComponent = (
                <Dataset
                    iconSize={this.state.iconSize}
                    imgJson={filteredImages}
                    tableData={this.state.tableData}
                    showDatasets={this.state.showDatasets}
                    handleImageWellClicked={this.handleImageWellClicked}
                    setImagesWellsSelected={this.setImagesWellsSelected}
                    thumbnails={thumbnails}
                    heatmapTableData={this.state.heatmapTableData}
                    viewMode={this.state.imageComponentViewMode}
                    />)
        }

        return(
                <div className="parade_layout_container">
                    <div className="layoutHeader">
                        <Progress loading={this.state.loading}/>
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
                        <div className="layoutControls">
                            <FlatButton
                                onClick={this.menuOnClick}
                                style={{
                                    height: "22px",
                                    marginRight: "2px"
                                }}
                                label="Settings"
                                labelStyle={{
                                    fontSize: "10px",
                                    fontWeight: "bold",
                                    lineHeight: "22px"
                                }}
                            />
                            <Popover
                                open={this.state.menuOpen}
                                anchorEl={this.state.anchorEl}
                                anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
                                targetOrigin={{vertical: 'top', horizontal: 'right'}}
                                onRequestClose={this.menuOnRequestClose}
                            >
                                {this.renderSettingsMenu()}
                            </Popover>
                            <div>
                                <button onClick={() => {this.setLayout("icon")}}
                                        className={"iconLayoutButton " + (this.state.layout === "icon" ? "checked" : "")} />
                                <button onClick={() => {this.setLayout("table")}}
                                        className={"tableLayoutButton " + (this.state.layout === "table" ? "checked" : "")} />
                                <button onClick={() => {this.setLayout("plot")}}
                                        className={"plotLayoutButton " + (this.state.layout === "plot" ? "checked" : "")} />
                            </div>
                        </div>
                    </div>
                    {imageComponent}
                    <Footer
                        iconSize={this.state.iconSize}
                        setIconSize={this.setIconSize}
                    />
                </div>)
    }
}

export default Layout
