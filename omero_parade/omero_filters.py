from omero.rtypes import rint
from django.http import JsonResponse
import json
from omero.sys import ParametersI
from omero_parade.utils import get_image_ids


def get_filters(request, conn):
    return ["ROI_count"]


def get_script(request, script_name, conn):
    """Return a JS function to filter images by various params."""
    dataset_id = request.GET.get('dataset')
    plate_id = request.GET.get('plate')
    field_id = request.GET.get('field')
    if plate_id and field_id:
        img_ids = get_image_ids(conn, plate_id, field_id)
    elif dataset_id:
        objects = conn.getObjects('Image', opts={'dataset': dataset_id})
        img_ids = [i.id for i in objects]
    query_service = conn.getQueryService()

    if script_name == "ROI_count":
        # Want to get ROI count for images in plate

        # Get ROI counts
        params = ParametersI()
        params.addIds(img_ids)
        query = "select roi.image.id, count(roi.id) from Roi roi "\
                "where roi.image.id in (:ids) group by roi.image"
        p = query_service.projection(query, params, conn.SERVICE_OPTS)
        roi_counts = {}
        for i in p:
            roi_counts[i[0].val] = i[1].val
        min_count = min(roi_counts.values())
        max_count = max(roi_counts.values())

        # Return a JS function that will be passed an object
        # e.g. {'type': 'Image', 'id': 1}
        # and should return true or false
        f = """(function filter(data, params) {
            var roi_counts = %s;
            if (isNaN(params.count) || params.count == '') return true;
            if (params.operator === '=')
                return roi_counts[data.id] == params.count;
            if (params.operator === '<')
                return roi_counts[data.id] < params.count;
            if (params.operator === '>')
                return roi_counts[data.id] > params.count;
        })
        """ % json.dumps(roi_counts)

        filter_params = [
            {'name': 'operator',
             'type': 'text',
             'values': ['>', '=', '<'],
             'default': '>'},
            {'name': 'count',
             'type': 'number',
             'default': '',
             'title': '%s-%s' % (min_count, max_count)}
        ]
        return JsonResponse(
            {
                'f': f,
                'params': filter_params,
            })
