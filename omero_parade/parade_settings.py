#!/usr/bin/env python
# -*- coding: utf-8 -*-

# Copyright (C) 2017 University of Dundee & Open Microscopy Environment.

"""Settings for the omero-parade app."""

import sys
import json
from omeroweb.settings import process_custom_settings, report_settings, \
    str_slash

# load settings
PARADE_SETTINGS_MAPPING = {

    "omero.web.parade.filters":
        ["PARADE_FILTERS",
         '["omero_parade", "annotation_filters"]',
         json.loads,
         ("Filters for filtering data. Each is a python module that contains an omero_filter module"
          "that has a get_filters function")],
}

process_custom_settings(sys.modules[__name__], 'PARADE_SETTINGS_MAPPING')
report_settings(sys.modules[__name__])
