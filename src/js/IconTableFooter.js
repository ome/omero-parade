
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
    },
    slider: {
        position: 'absolute',
        right: 25,
        width: 120,
        top: 6,
    }
}

const IconTableFooter = ({setIconSize, iconSize}) => (
    <div style={styles.footer} >
        <input
            type="range"
            style={styles.slider}
            className="parade"
            min="30"
            max="200"
            value={iconSize}
            onChange={(event) => {setIconSize(event.target.value)}}
        />
    </div>
);

export default IconTableFooter
