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

"""Django views methods."""

import numpy
import omero
import omero.clients

from base64 import b64decode
from distutils.version import LooseVersion

from django.http import JsonResponse
from omeroweb.webclient.decorators import login_required
from omero.rtypes import rlong, unwrap
from django.shortcuts import render
from . import parade_settings


NUMPY_GT_1_11_0 = False
if LooseVersion(numpy.__version__) > LooseVersion('1.11.0'):
    NUMPY_GT_1_11_0 = True


@login_required()
def index(request, **kwargs):
    return render(request, "omero_parade/index.html", {})


@login_required()
def search(request, conn=None, **kwargs):
    """Do a FullText search using text from ?query=text."""
    search = conn.createSearchService()
    text = request.GET.get('query', None)
    if text is None:
        return JsonResponse({'error': 'Search with ?query=text'})
    search.onlyType("Image", conn.SERVICE_OPTS)
    search.byFullText(text, conn.SERVICE_OPTS)

    images = []
    if search.hasNext(conn.SERVICE_OPTS):
        for i in search.results(conn.SERVICE_OPTS):
            images.append({'id': i.id.val, 'name': i.name.val})

    return JsonResponse({'data': images})


def get_long_or_default(request, name, default):
    """
    Retrieve a parameter from the request.

    If the parameter is not present the default is returned
    """
    val = None
    val_raw = request.GET.get(name, default)
    if val_raw is not None:
        val = long(val_raw)
    return val


@login_required()
def api_field_list(request, plate_id, conn=None, **kwargs):
    """Return the field indexes for a Plate."""
    q = conn.getQueryService()

    sql = "SELECT DISTINCT indices(ws), ws.plateAcquisition.id FROM Well w " \
        "JOIN w.wellSamples AS ws " \
        "WHERE w.plate.id = :id"
    params = omero.sys.ParametersI()
    params.addId(rlong(plate_id))
    rows = q.projection(sql, params, conn.SERVICE_OPTS)
    return JsonResponse({
        'plateId': long(plate_id),
        'data': [[unwrap(x), unwrap(y)] for x, y in rows]
    })


@login_required()
def filter_list(request, conn=None, **kwargs):

    filter_modules = parade_settings.PARADE_FILTERS

    filters = []
    for m in filter_modules:
        module = __import__('%s.omero_filters' % m, fromlist=[''])
        filters.extend(module.get_filters(request, conn))

    return JsonResponse({'data': filters})


@login_required()
def filter_script(request, filter_name, conn=None, **kwargs):

    filter_modules = parade_settings.PARADE_FILTERS

    for m in filter_modules:
        try:
            module = __import__('%s.omero_filters' % m, fromlist=[''])
            if filter_name in module.get_filters(request, conn):
                return module.get_script(request, filter_name, conn)
        except ImportError:
            pass

    return JsonResponse({'Error': 'Filter script not found'})


@login_required()
def dataprovider_list(request, conn=None, **kwargs):

    modules = parade_settings.PARADE_FILTERS

    dps = []
    for m in modules:
        try:
            module = __import__('%s.data_providers' % m, fromlist=[''])
            if hasattr(module, 'get_dataproviders'):
                data = module.get_dataproviders(request, conn)
                dps.extend(data)
        except ImportError:
            pass

    return JsonResponse({'data': dps})


@login_required()
def get_data(request, data_name, conn=None, **kwargs):
    try:
        data_name = b64decode(data_name)
    except Exception:
        return JsonResponse(
            {'Error': 'Could not Base64 decode: %s' % data_name}
        )

    modules = parade_settings.PARADE_FILTERS

    for m in modules:
        try:
            module = __import__('%s.data_providers' % m, fromlist=[''])
            if hasattr(module, 'get_dataproviders'):
                dp = module.get_dataproviders(request, conn)
                if data_name in dp:
                    data = module.get_data(request, data_name, conn)
                    values = numpy.array(data.values())
                    bins = 10
                    if NUMPY_GT_1_11_0:
                        # numpy.histogram() only supports bin calculation
                        # from 1.11.0 onwards
                        bins = 'auto'
                    histogram, bin_edges = numpy.histogram(values, bins=bins)
                    return JsonResponse({
                        'data': data,
                        'min': numpy.amin(values).item(),
                        'max': numpy.amax(values).item(),
                        'histogram': histogram.tolist()
                    })
        except ImportError:
            pass

    return JsonResponse({'Error': 'Data provider not found'})
