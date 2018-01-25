"""Django views methods."""

import omero
import omero.clients

from django.http import Http404, JsonResponse
from omeroweb.webclient.decorators import login_required
from omero.rtypes import rlong, unwrap
from . import parade_settings


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


def index(request):
    return JsonResponse({'index': 'placeholder'})


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


def filter_list(request):

    filter_modules = parade_settings.PARADE_FILTERS

    print "filter_modules", filter_modules

    filters = []
    for m in filter_modules:
        module = __import__('%s.omero_filters' % m)
        filters.extend(module.omero_filters.get_filters())

    return JsonResponse({'data': filters})


@login_required()
def filter_script(request, filter_name, conn=None, **kwargs):

    filter_modules = parade_settings.PARADE_FILTERS

    for m in filter_modules:
        module = __import__('%s.omero_filters' % m)
        if filter_name in module.omero_filters.get_filters():
            return module.omero_filters.get_script(request, filter_name, conn)

    return JsonResponse({'Error': 'Filter script not found'})
