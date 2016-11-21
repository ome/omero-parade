import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

function omero_parade(imageIds) {
  console.log("testing...", imageIds);
  ReactDOM.render(
    <App imageIds={imageIds} />,
    document.getElementById('omero_parade')
  );
}

export default omero_parade;
