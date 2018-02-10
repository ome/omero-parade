
import React, { Component } from 'react';
import FilterContainer from '../filter/FilterContainer';
import PlateGrid from '../plate/PlateGrid';
import Footer from '../Footer';
import Dataset from '../dataset/Dataset';

export default React.createClass({

    getInitialState: function() {
        return {
            iconSize: 50,
        }
    },

    setIconSize: function(size) {
        this.setState({iconSize: parseInt(size, 10)});
    },

    componentDidMount: function() {
        
    },

    render: function() {
        if (this.props.plateData === undefined && this.props.filteredImages === undefined) {
            return(<div></div>)
        }
        let imageComponent;
        if (this.props.plateData) {
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
                    {imageComponent}
                    <Footer
                        iconSize={this.state.iconSize}
                        setIconSize={this.setIconSize} />
                </div>)
    }
});
