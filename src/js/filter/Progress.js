//
// Copyright (C) 2018 Glencoe Software, Inc.
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

import config from '../config';

class Progress extends React.Component {

    render() {
        if (!this.props.loading) {
            return null;
        }
        return (
            <img className={"waiting"}
                 src={config.staticPrefix + "webgateway/img/spacer.gif"}
                 style={{margin: "0px 4px", width: "12px", height: "12px"}}
            />
        )
    }

}

export default Progress
