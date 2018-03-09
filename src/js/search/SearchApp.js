import React from 'react';
import ReactDOM from 'react-dom';
import SearchForm from './SearchForm';
import FilterHub from '../filter/FilterHub';

class SearchApp extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            searchResults: []
        }
        this.setSearchResults = this.setSearchResults.bind(this);
        this.setSelectedImages = this.setSelectedImages.bind(this);
    }

    setSearchResults(results) {
        this.setState({
            searchResults: results
        });
    }

    setSelectedImages(images) {
        console.log('TODO setSelectedImages...', images)
    }

    render() {
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
}

export default SearchApp
