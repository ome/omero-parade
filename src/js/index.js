import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import SearchApp from './search/SearchApp';

// Export a function for rendering omero_parade as a centre panel plugin
function omero_parade(selected, jstree) {
  ReactDOM.render(
    <App
        selected={selected}
        jstree={jstree} />,
    document.getElementById('omero_parade')
  );
}

// Full page app
function full_page_app(element_id) {
  ReactDOM.render(
    <SearchApp />,
    document.getElementById(element_id)
  );
}

export { omero_parade, full_page_app }
