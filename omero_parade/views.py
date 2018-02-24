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

import omero
import omero.clients

from django.http import Http404, JsonResponse
from omeroweb.webclient.decorators import login_required
from omero.rtypes import rlong, unwrap
from . import parade_settings


def index(request):
    return JsonResponse({"Index": "Placeholder"})


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
def api_field_list(request, conn=None, **kwargs):
    """Return the min and max-indexed well samples for plate/run."""
    plate_id = get_long_or_default(request, 'plate', None)
    run_id = get_long_or_default(request, 'run', None)
    if (plate_id is None and run_id is None):
        raise Http404('Need to use ?plate=pid or ?run=runid')

    q = conn.getQueryService()
    sql = "select minIndex(ws), maxIndex(ws) from Well w " \
        "join w.wellSamples ws"

    params = omero.sys.ParametersI()

    if run_id is not None:
        sql += " where ws.plateAcquisition.id=:runid"
        params.add('runid', rlong(run_id))
    if plate_id is not None:
        sql += " where w.plate.id=:pid"
        params.add('pid', rlong(plate_id))

    fields = []

    res = q.projection(sql, params, conn.SERVICE_OPTS)
    res = [r for r in unwrap(res)[0] if r is not None]
    if len(res) == 2:
        fields = res

    return JsonResponse({'data': fields})


@login_required()
def filter_list(request, conn=None, **kwargs):

    filter_modules = parade_settings.PARADE_FILTERS

    print "filter_modules", filter_modules

    filters = []
    for m in filter_modules:
        module = __import__('%s.omero_filters' % m)
        filters.extend(module.omero_filters.get_filters(request, conn))

    return JsonResponse({'data': filters})


@login_required()
def filter_script(request, filter_name, conn=None, **kwargs):

    filter_modules = parade_settings.PARADE_FILTERS

    for m in filter_modules:
        module = __import__('%s.omero_filters' % m)
        if filter_name in module.omero_filters.get_filters(request, conn):
            return module.omero_filters.get_script(request, filter_name, conn)

    return JsonResponse({'Error': 'Filter script not found'})


@login_required()
def dataprovider_list(request, conn=None, **kwargs):

    modules = parade_settings.PARADE_FILTERS

    dps = []
    for m in modules:
        try:
            module = __import__('%s.data_providers' % m)
            if hasattr(module.data_providers, 'get_dataproviders'):
                data = module.data_providers.get_dataproviders(request, conn)
                dps.extend(data)
        except ImportError:
            pass

    return JsonResponse({'data': dps})


@login_required()
def get_data(request, data_name, conn=None, **kwargs):

    modules = parade_settings.PARADE_FILTERS

    for m in modules:
        try:
            module = __import__('%s.data_providers' % m)
            if hasattr(module.data_providers, 'get_dataproviders'):
                dp = module.data_providers.get_dataproviders(request, conn)
                if data_name in dp:
                    data = module.data_providers.get_data(request, data_name,
                                                          conn)
                    return JsonResponse({'data': data})
        except ImportError:
            pass

    return JsonResponse({'Error': 'Data provier not found'})
