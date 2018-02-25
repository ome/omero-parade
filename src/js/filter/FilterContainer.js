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
import ParadeFilter from './ParadeFilter';


export default React.createClass({

    getInitialState: function() {
        return {
            filters: [],
        }
    },

    componentDidMount: function() {
        // list available filters (TODO: only for current data? e.g. plate)
        let url = window.PARADE_FILTERS_URL;
        if (this.props.plateId) url += '?plate=' + this.props.plateId;
        if (this.props.datasetId) url += '?dataset=' + this.props.plateId;
        $.ajax({
            url: url,
            dataType: 'json',
            cache: false,
            success: function(data) {
                if (this.isMounted()) {
                    this.setState({
                        filters: data.data,
                    });
                }
            }.bind(this)
        });
    },

    handleAddFilter: function(event) {
        // When user chooses to ADD a filter by Name, setState of parent
        var filterName = event.target.value;
        if (filterName !== "--") {
            this.props.addFilter(filterName);
        }
    },

    render: function() {
        return(
            <div className="filterContainer">
                <select value={"--"} onChange={this.handleAddFilter}>
                    <option
                        value="--" >
                        Add filter...
                    </option>
                    {this.state.filters.map(function(n, i){
                        return (
                            <option
                                key={i}
                                value={n}>
                                {n}
                            </option>
                        );
                    })}
                </select>
                <br />
                {
                    this.props.filterNames.map((fname, idx) => (
                        <ParadeFilter
                            key={fname + idx}
                            filterIndex={idx}
                            name={fname}
                            datasetId={this.props.datasetId}
                            plateId={this.props.plateId}
                            fieldId={this.props.fieldId}
                            handleFilterLoaded={this.props.handleFilterLoaded}
                            handleFilterChange={this.props.handleFilterChange}
                            handleRemoveFilter={this.props.handleRemoveFilter}
                        />
                    ))
                }
            </div>
        )
    }
});
