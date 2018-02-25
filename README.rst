.. image:: https://travis-ci.org/ome/omero-parade.svg?branch=master
    :target: https://travis-ci.org/ome/omero-parade

.. image:: https://badge.fury.io/py/omero-parade.svg
    :target: https://badge.fury.io/py/omero-parade

OMERO.parade
============

An OMERO.web app for displaying Dataset thumbnails or Plates in OMERO.web centre panel

For full details see `SUPPORT.md <https://github.com/ome/omero-parade/blob/master/SUPPORT.md>`_.

Requirements
============

* OMERO 5.4.0 or newer.


Installing from PyPI
====================

This section assumes that an OMERO.web is already installed.

Install the app using `pip <https://pip.pypa.io/en/stable/>`_:

::

    $ pip install -U omero-parade

Add parade custom app to your installed web apps:

::

    $ bin/omero config append omero.web.apps '"omero_parade"'

Display parade in the centre of the webclient:

::

    $ bin/omero config append omero.web.ui.center_plugins '["Parade",
      "omero_parade/init.js.html", "omero_parade"]' 

Add a link to the app in its own window:

::

    $ bin/omero config append omero.web.ui.top_links '["Parade",
      "parade_index", {"title": "Search and filter in OMERO.parade"}]'

Now restart OMERO.web as normal.

Build
=====

In order to build you need:

* npm version equal or greater to 3.0!

::

    $ npm install

To build an uncompressed version, run:

::

    $ npm run dev
