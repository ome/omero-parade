
import React, { Component } from 'react';
import FilterContainer from '../filter/FilterContainer';
import DataTable from './DataTable';
import PlateGrid from '../plate/PlateGrid';
import Dataset from '../dataset/Dataset';
import Footer from '../Footer';

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


    render: function() {
        if (this.props.plateData === undefined && this.props.filteredImages === undefined) {
            return(<div></div>)
        }
        let imageComponent;
        if (this.state.layout === "table") {
            imageComponent = (
                <DataTable
                    iconSize={this.state.iconSize}
                    imgJson={this.props.filteredImages}
                    jstree = {this.props.jstree}
                    tableData={this.state.tableData}
                    />)
        } else if (this.props.plateData) {
            imageComponent = (
                <PlateGrid
                    iconSize={this.state.iconSize}
                    plateData={this.props.plateData}
                    filteredImages={this.props.filteredImages}
                    tableData={this.state.tableData}
                    fieldId={this.props.fieldId}
                    />)
        } else {
            imageComponent = (
                <Dataset
                    iconSize={this.state.iconSize}
                    imgJson={this.props.filteredImages}
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
