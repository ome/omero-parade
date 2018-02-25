import React from 'react';
import ReactDOM from 'react-dom';

export default React.createClass({

    getInitialState: function() {
        return {
            text: "",
        }
    },
    
    handleChange: function(e) {
        this.setState({ text: e.target.value });
    },

    handleSubmit: function(e) {
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
    },

    render: function() {
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
});
