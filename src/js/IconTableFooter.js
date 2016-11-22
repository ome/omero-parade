
import React, { Component } from 'react';

const styles = {
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 25,
        borderRight: 0,
        borderBottom: 'solid 1px hsl(210,10%,90%)',
        overflow: 'hidden',
        background: 'none repeat scroll 0 0 #EFF1F4',
    }
}

const IconTableFooter = React.createClass({

    componentDidMount: function() {
        var setIconSize = this.props.setIconSize,
            iconSize = this.props.iconSize;
        $(this.refs.thumbSlider).slider({
            max: 200,
            min: 30,
            value: iconSize,
            slide: function(event, ui) {
                setIconSize(ui.value);
            }
        });
    },

    componentWillUnmount: function() {
        // cleanup plugin
        $(this.refs.thumbSlider).slider( "destroy" );
    },

    render: function() {
        return (
            <div style={styles.footer} >
                <div
                    ref="thumbSlider"
                    title="Zoom Thumbnails" />
            </div>
        );
    }
});

export default IconTableFooter
