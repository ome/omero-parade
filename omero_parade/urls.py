"""Django urls."""

from django.conf.urls import url, patterns

import views

urlpatterns = patterns(
    '',

    # Home page
    url(r'^$', views.index, name="parade_index"),

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
    url(r'^data/(?P<data_name>[\w.]+)/$', views.get_data,
    	name='parade_data'),
)
