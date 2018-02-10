
import React, { Component } from 'react';

const styles = {
    selected: {
        color: 'white',
        backgroundColor: '#3875d7',
        border: 'solid 1px #3875d7',
        boxShadow: '0 1px 1px rgba(0,0,0,0.2)',
    },
    fsSelected: {
        backgroundColor: '#cddcfc',
        border: 'solid 1px #cddcfc',
    }
}

const ImageIcon = React.createClass({

    handleIconClick: function(event) {
        // this.setState ({selected: true});
        this.props.handleIconClick(this.props.image.id, event);
    },

    // getInitialState: function() {
    //     return {selected: this.props.image.selected};
    // },

    getIconSizes: function() {
        var image = this.props.image,
            width = this.props.iconSize,
            height = this.props.iconSize,
            wh = image.data.obj.sizeX / image.data.obj.sizeY;
        if (wh < 1) {
            width = width * wh;
        } else if (wh > 1) {
            height = height / wh;
        }
        return {'width': width, 'height': height}
    },

    // After rendering, scroll selectd icon into view
    // NB: scrollIntoViewIfNeeded() is provided by polyfill
    componentDidUpdate: function() {
        if (this.props.image.selected && this.refs.icon) {
            this.refs.icon.scrollIntoViewIfNeeded();
        }
    },

    render: function() {

        var image = this.props.image,
            iconSizes = this.getIconSizes(),
            cls = [];

        let iconStyle = {width: this.props.iconSize, height: this.props.iconSize};
        if (image.fsSelected) {
            iconStyle = Object.assign({}, iconStyle, styles.fsSelected)
        };
        if (image.selected) {
            iconStyle = Object.assign({}, iconStyle, styles.selected)
        };

        return (
            <li className={"datasetThumb " + cls.join(" ")}
                id={"image_icon-" + image.id}
                style={iconStyle}
                ref="icon"
                data-fileset={image.data.obj.filesetId}
                data-type="image"
                data-id={image.id}
                data-perms={image.data.obj.permsCss}
                tabIndex={0}
                onClick={this.handleIconClick}
            >
                    <img alt="image"
                        width={iconSizes.width + "px"}
                        height={iconSizes.height + "px"}
                        src={"/webgateway/render_thumbnail/" + image.id + "/"}
                        title={image.name} />
            </li>
        )
    }
});

export default ImageIcon
