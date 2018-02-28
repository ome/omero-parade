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


Custom Filtering
================

Users can customize the filtering options available by adding their own
python modules to the setting:

::

    omero.web.parade.filters

The current default setting lists the ``omero_parade`` app itself and two
other modules that are in the same directory and are therefore expected to
be on the PYTHONPATH when the app is installed.

::

    '["omero_parade", "annotation_filters", "table_filters"]'

Each of these modules contains an ``omero_filters.py`` which is expected to
implement 2 methods: ``get_filters`` and ``get_script``.

The ``get_filters`` method is used to compile the list of filters returned
by the URL ``/omero_parade/filters/``.

Some examples of ``get_filters``:

::
    # Return a list of filter names.
    def get_filters(request, conn):
        return ["Rating", "Comment", "Tag"]

The request may include ``plate`` or ``dataset`` ID if we only want to
support the filter for certain data types. In this example we could even
check whether an OMERO.table exists on the plate.
::
    def get_filters(request, conn):
        if request.GET.get('plate', None) is not None:
            return ["Table"]
        return []

The ``get_script`` function for a named filter should return a ``JsonResponse``
that includes a list of parameters for the user input to the filter
and a JavaScript filter function.

The JavaScript function will be called for each image to filter and will
also be passed in a params object with the user input.

::

    # Return a JS function to filter images by various params.
    def get_script(request, script_name, conn):

        dataset_id = request.GET.get('dataset')
        // OR...
        plate_id = request.GET.get('plate')

        if script_name == "Rating":
            # Load rating data for images in Dataset or Wells in Plate...
            # ...
            # var ratings = {imageId: rating} for all images
            var js_object_attr = 'id';  # or 'wellId' if filtering Wells

            # Return a JS function that will be passed an object
            # e.g. {id: 1} for Image or {id: 1, wellId:2} for Image in Well.
            # and should return true or false
            f = """(function filter(data, params) {
                var ratings = %s;
                var match = ratings[data.%s] == params.rating;
                return (params.rating === '-' || match);
            })
            """ % (json.dumps(ratings), js_object_attr)

            filter_params = [{'name': 'rating',
                            'type': 'text',
                            'values': ['-', '1', '2', '3', '4', '5'],
                            'default': '-',
                            }]
            return JsonResponse(
                {
                    'f': f,
                    'params': filter_params,
                })
