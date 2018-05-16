//
// Copyright (C) 2018 University of Dundee & Open Microscopy Environment.
// All rights reserved.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.
//

import React, { Component } from 'react';
import FlatButton from 'material-ui/FlatButton';
import Popover from 'material-ui/Popover';

const styles = {
    footer: {
        position: 'relative',
        height: 25,
        flex: '0 0 25px',
        borderRight: 0,
        borderBottom: 'solid 1px hsl(210,10%,90%)',
        overflow: 'hidden',
        background: 'none repeat scroll 0 0 #EFF1F4',
    },
    slider: {
        position: 'absolute',
        right: 25,
        width: 120,
        top: 4,
        border: 'solid #aaa 1px',
    }
}

class Footer extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            menuOpen: false
        };
        this.menuOnRequestClose = this.menuOnRequestClose.bind(this);
        this.menuOnClick = this.menuOnClick.bind(this);
    }

    menuOnClick(event) {
        // Prevents ghost click
        event.preventDefault();

        this.setState({
            menuOpen: true,
            anchorEl: event.currentTarget
        });
    }

    menuOnRequestClose() {
        this.setState({
            menuOpen: false
        });
    }

    render() {
        let {setIconSize, iconSize, settingsMenu} = this.props;
        return (
            <div style={styles.footer} >
                <FlatButton
                    onClick={this.menuOnClick}
                    style={{
                        height: "26px",
                        position: "absolute",
                        right: "150px"
                    }}
                    label="Settings"
                    labelStyle={{
                        fontSize: "10px",
                        fontWeight: "bold",
                        lineHeight: "24px"
                    }}
                />
                <Popover
                    open={this.state.menuOpen}
                    anchorEl={this.state.anchorEl}
                    anchorOrigin={{vertical: 'top', horizontal: 'right'}}
                    targetOrigin={{vertical: 'bottom', horizontal: 'right'}}
                    onRequestClose={this.menuOnRequestClose}
                >
                    {settingsMenu}
                </Popover>
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
    }
}

export default Footer
