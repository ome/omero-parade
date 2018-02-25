import React from 'react';
import ReactDOM from 'react-dom';
import SearchForm from './SearchForm';

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

    render: function() {
        return (
            <div className="columnContainer">
                <div className="leftPanel">
                    <SearchForm 
                        setSearchResults={this.setSearchResults} />
                </div>
                <div className="paradeCentrePanel">
                    {this.state.searchResults.map(image => (
                        <p key={image.id}>
                            ID: {image.id}, {image.name}
                        </p>
                    ))}
                </div>

                <div className="rightPanel">
                </div>
            </div>
        )
    }
});
