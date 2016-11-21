# omero-parade
OMERO.web plugin for displaying Dataset thumbnails or Plates in webclient center panel


Install
-------

Build for development:

	$ cd omero-parade
	$ npm install

	$ npm run dev

Add to config:

	$ bin/omero config append omero.web.apps 'omero_parade"'
	$ bin/omero config append omero.web.ui.center_plugins '["Parade", "omero_parade/init.js.html", "omero_parade"]'
