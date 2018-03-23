#
# Copyright (c) 2018 University of Dundee.
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as
# published by the Free Software Foundation, either version 3 of the
# License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.
#

"""Django urls."""

from django.conf.urls import url, patterns
import views


urlpatterns = patterns(
    '',

    # Home page
    url(r'^$', views.index, name="parade_index"),

    # GET search results. Use ?query=foo
    url(r'^search/$', views.search, name='parade_search'),

    # list fields in Plate ?plate=123 or Acquisition ?run=456
    url(r'^api/fields/$', views.api_field_list, name='parade_fields'),

    # list functions for filtering data
    # url(r'^api/filters/$', views.api_filter_list, name='parade_filters'),
    url(r'^filters/$', views.filter_list, name='parade_filters'),

    # Get the script - need to also include current data to be filtered
    # e.g. ?plate=1
    url(r'^filters/script/(?P<filter_name>[\w.]+)/$', views.filter_script,
        name='parade_filter_script'),

    # list sources of table data
    url(r'^dataproviders/$', views.dataprovider_list,
        name='parade_dataproviders'),

    # Get the table data
    url(r'^data/(?P<data_name>[\w+\/=]+)/$', views.get_data,
        name='parade_data'),
)
