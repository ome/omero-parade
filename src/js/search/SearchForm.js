import React from 'react';
import ReactDOM from 'react-dom';

class SearchForm extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            text: "",
        }
    }
    
    handleChange(e) {
        this.setState({ text: e.target.value });
    }

    handleSubmit(e) {
        e.preventDefault();
        if (!this.state.text.length) {
            return;
        }
        let url= PARADE_INDEX_URL + "search/?query=" + this.state.text;
        $.getJSON(url,
            data => {
                console.log(data.data);
                this.props.setSearchResults(data.data);
            }
        );
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                <h2>Search</h2>
                <input
                    onChange={this.handleChange}
                    name="search_query"
                    placeholder="Search for Images"
                />
                <button>Search</button>
            </form>
        )
    }
}

export default SearchForm
