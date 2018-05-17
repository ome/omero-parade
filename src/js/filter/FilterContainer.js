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
import axios from 'axios';
import qs from 'qs';

import ParadeFilter from './ParadeFilter';
import Progress from './Progress';
import config from '../config';


class FilterContainer extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            filters: [],
        }
        this.handleAddFilter = this.handleAddFilter.bind(this);
    }

    componentDidMount() {
        const CancelToken = axios.CancelToken;
        this.source = CancelToken.source();
        let params = {
            image: this.props.images.map(v => v.id)
        };
        if (this.props.parentType && this.props.parentId) {
            params = {
                [this.props.parentType]: this.props.parentId
            }
        }
        this.setState({
            loading: true
        });
        axios.get(config.filtersUrl, {
            cancelToken: this.source.token,
            params: params,
            paramsSerializer: params => (
                qs.stringify(params, { indices: false })
            )
        }).then(
            (response) => {
                this.setState({
                    filters: response.data.data,
                    loading: false
                });
            },
            (thrown) => {
                if (axios.isCancel(thrown)) {
                    return;
                }
                this.setState({
                    loading: false
                });
                // TODO: Put this error somewhere "correct"
                console.log("Error loading filters!", thrown);
            }
        );
    }

    componentWillUnmount() {
        if (this.source) {
            this.source.cancel();
        }
    }

    handleAddFilter(event) {
        // When user chooses to ADD a filter by Name, setState of parent
        var filterName = event.target.value;
        if (filterName !== "--") {
            this.props.addFilter(filterName);
        }
    }

    render() {
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
                <Progress loading={this.state.loading}/>
                <br />
                {
                    this.props.filterNames.map((fname, idx) => (
                        <ParadeFilter
                            key={fname + idx}
                            filterIndex={idx}
                            filterValues={this.props.filterValues[idx]}
                            name={fname}
                            parentType={this.props.parentType}
                            parentId={this.props.parentId}
                            plateData={this.props.plateData}
                            images={this.props.images}
                            handleFilterLoaded={this.props.handleFilterLoaded}
                            handleFilterChange={this.props.handleFilterChange}
                            handleRemoveFilter={this.props.handleRemoveFilter}
                        />
                    ))
                }
            </div>
        )
    }
}

export default FilterContainer
