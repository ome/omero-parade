
import React, { Component } from 'react';

let styles = {
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
    },
    chooser: {
        position: 'absolute',
        right: 20,
        top: 4,
        border: '1px solid #9EA5AC',
        backgroundColor: '#E3E5E7',
        borderRadius: 4,
        padding: 0,
    },
    button: {
        width: 25,
        height: 20,
        borderRight: '1px solid #9EA5AC',
        borderLeft: 0,
        borderBottom: 0,
        borderTop: 0,
        cusor: 'pointer'
    },
    btnLeft: {
        borderBottomLeftRadius: 4,
        borderTopLeftRadius: 4,
    },
    btnRight: {
        borderBottomRightRadius: 4,
        borderTopRightRadius: 4,
    },
    checked: {
        backgroundColor: '#B2BDCB',
    }
}

// We add the styles.button to btnLeft & btnRight styles
Object.assign(styles.btnLeft, styles.button)
Object.assign(styles.btnRight, styles.button, {borderRight: 0})

const a = Object.assign

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
        // Add 'checked' style to appropriate button depending on layout
        var iconBtnStyle = layout === "icon" ? a({}, styles.btnLeft, styles.checked) : styles.btnLeft,
            tableBtnStyle = layout === "table" ? a({}, styles.btnRight, styles.checked) : styles.btnRight;
        return (
            <div style={styles.toolbar} >
                <div style={styles.chooser} >
                    <button
                        onClick={this.handleLayoutClick}
                        title="View as Thumbnails"
                        data-layout="icon"
                        style={iconBtnStyle}
                        className="parade_icon_layout" />
                    <button
                        onClick={this.handleLayoutClick}
                        title="View as List"
                        data-layout="table"
                        style={tableBtnStyle}
                        className="parade_table_layout" />
                </div>
                <form className="search filtersearch" action="#" style={{top: 4}}>
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
