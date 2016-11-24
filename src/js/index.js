import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

function omero_parade(selected, jstree) {
  ReactDOM.render(
    <App
        selected={selected}
        jstree={jstree} />,
    document.getElementById('omero_parade')
  );
}

export default omero_parade;
