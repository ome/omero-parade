
import React, { Component } from 'react';

const styles = {
    toolbar: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 29,
        borderRight: 0,
        borderBottom: 'solid 1px hsl(210,10%,90%)',
        overflow: 'hidden',
        background: 'none repeat scroll 0 0 #EFF1F4',
    }
}

const IconTableHeader = React.createClass({

    handleLayoutClick: function(event) {
        var layout = event.target.getAttribute('data-layout');
        this.props.setLayout(layout);
    },

    handleFilterChange: function(event) {
        var filterText = event.target.value;
        this.props.setFilterText(filterText);
    },

    render: function() {
        var layout = this.props.layout,
            filterText = this.props.filterText;
        var iconBtnClass = layout === "icon" ? "checked" : "",
            tableBtnClass = layout === "table" ? "checked" : "";
        return (
            <div style={styles.toolbar} >
                <div id="layout_chooser">
                    <button
                        onClick={this.handleLayoutClick}
                        title="View as Thumbnails"
                        data-layout="icon"
                        className={iconBtnClass} />
                    <button
                        onClick={this.handleLayoutClick}
                        title="View as List"
                        data-layout="table"
                        className={tableBtnClass} />
                </div>
                <form className="search filtersearch" id="filtersearch" action="#" style={{top: 4}}>
                    <div>
                        <input
                            type="text"
                            placeholder="Filter Images"
                            onKeyUp={this.handleFilterChange}
                            size={25} />
                    </div>
                    <span className="loading" style={{display: 'none'}} />
                </form>
            </div>
        );
    }
});

export default IconTableHeader
