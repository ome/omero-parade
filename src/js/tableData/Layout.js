
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
                    />)
        } else if (this.props.plateData) {
            imageComponent = (
                <PlateGrid
                    iconSize={this.state.iconSize}
                    plateData={this.props.plateData}
                    filteredImages={this.props.filteredImages}
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
