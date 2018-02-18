
import React, { Component } from 'react';
import ImageIcon from './ImageIcon'

const Dataset = React.createClass({

    componentDidMount: function() {
        $(this.refs.dataIcons).selectable({
            filter: 'li.datasetThumb',
            distance: 2,
            stop: () => {
                // Make the same selection in the jstree etc
                let ids = [];
                $(".parade_centrePanel .ui-selected").each(function(){
                    ids.push(parseInt($(this).attr('data-id'), 10));
                });
                console.log('Dataset', ids);
                this.props.setImagesWellsSelected('image', ids);
            },
        });
    },

    componentWillUnmount: function() {
        // cleanup plugin
        $(this.refs.dataIcons).selectable( "destroy" );
    },

    render() {
        let {imgJson, iconSize, setIconSize, 
             layout, setLayout} = this.props;

        return (
            <div className="parade_centrePanel">
                <ul
                    ref="dataIcons"
                    className={layout + "Layout"}>
                    {imgJson.map(image => (
                        <ImageIcon
                            image={image}
                            key={image.id}
                            iconSize={iconSize}
                            handleIconClick={this.handleIconClick} />
                    ))}
                </ul>
            </div>
        );
    }
});

export default Dataset
