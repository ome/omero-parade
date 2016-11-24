
import React, { Component } from 'react';
import IconTableHeader from './IconTableHeader'
import IconTableHeadRow from './IconTableHeadRow'
import ImageIcon from './ImageIcon'

const styles = {
    thumbContainer: {
        position: 'absolute',
        bottom: 25,
        left: 0,
        top: 29,
        overflow: 'auto',
        marginTop: 0,
        right: 0,
    }
}

const Dataset = React.createClass({

    componentDidMount: function() {
        var inst = this.props.inst;
        $(this.refs.dataIcons).selectable({
            filter: 'li.row',
            distance: 2,
            stop: function() {
                // Make the same selection in the jstree etc
                $(".ui-selected").each(function(){
                    var imageId = $(this).attr('data-id');
                    var containerNode = OME.getTreeImageContainerBestGuess(imageId);
                    var selectedNode = inst.locate_node('image-' + imageId, containerNode)[0];
                    inst.select_node(selectedNode);
                });
            },
            start: function() {
                inst.deselect_all();
            }
        });
    },

    componentWillUnmount: function() {
        // cleanup plugin
        $(this.refs.dataIcons).selectable( "destroy" );
    },

    render() {
        let {imgJson, iconSize, handleIconClick, filterText, setFilterText, layout, setLayout} = this.props;

        var icons = imgJson.map(function(image){
            return (
                <ImageIcon
                    image={image}
                    key={image.id}
                    iconSize={iconSize}
                    handleIconClick={handleIconClick} />
            );
        });

        return (
            <div className="centrePanel">
                <IconTableHeader
                        filterText={filterText}
                        setFilterText={setFilterText}
                        layout={layout}
                        setLayout={setLayout} />
                <div style={styles.thumbContainer} >
                    <ul
                        ref="dataIcons"
                        className={layout + "Layout"}>
                        <IconTableHeadRow />
                        {icons}
                    </ul>
                </div>
            </div>
        );
    }
});

export default Dataset
