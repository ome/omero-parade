
import React, { Component } from 'react';

var IconTableHeadRow = React.createClass({
    render: function() {
        return (
            <li className="thead"> 
            <div /> 
            <div className="sort-alpha">Name</div>
            <div className="sort-date">Date</div> 
            <div className="sort-numeric">Size X</div> 
            <div className="sort-numeric">Size Y</div> 
            <div className="sort-numeric">Size Z</div>
            </li>
        );
    }
});

export default IconTableHeadRow
