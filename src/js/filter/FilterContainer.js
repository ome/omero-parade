import React, { Component } from 'react';


export default React.createClass({

    componentDidMount: function() {
        console.log("Fitler mount", this.props.plateId, this.props.fieldId);
    },

    render: function() {
        return(<h2>Filter</h2>)
    }
});
