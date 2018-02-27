import React from 'react';
import ReactDOM from 'react-dom';
import SearchForm from './SearchForm';
import FilterHub from '../filter/FilterHub';

export default React.createClass({

    getInitialState: function() {
        return {
            searchResults: []
        }
    },

    setSearchResults: function(results) {
        this.setState({
            searchResults: results
        });
    },

    setSelectedImages: function(images) {
        console.log('TODO setSelectedImages...', images)
    },

    render: function() {
        return (
            <div className="columnContainer">
                <div className="leftPanel">
                    <SearchForm 
                        setSearchResults={this.setSearchResults} />
                </div>
                <div className="paradeCentrePanel">
                    <FilterHub
                        setSelectedImages = {this.setSelectedImages}
                        images={this.state.searchResults}
                    />
                </div>

                <div className="rightPanel">
                </div>
            </div>
        )
    }
});
