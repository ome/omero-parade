import React from 'react';
import ReactDOM from 'react-dom';
import CentrePanel from './CentrePanel';

function omero_parade(selected, jstree) {
  console.log("testing...", selected, jstree);
  ReactDOM.render(
    <CentrePanel
        selected={selected}
        jstree={jstree} />,
    document.getElementById('omero_parade')
  );
}

export default omero_parade;
