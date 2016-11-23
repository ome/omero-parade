"""Django urls."""

from django.conf.urls import url, patterns

import views

urlpatterns = patterns(
    '',

    # Home page
    # url(r'^$', views.load_template, name="parade_index"),

    # list fields in Plate ?plate=123 or Acquisition ?run=456
    url(r'^api/fields/$', views.api_field_list, name='parade_fields'),
)