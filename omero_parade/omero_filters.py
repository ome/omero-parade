from omero.rtypes import rint
from django.http import JsonResponse
import json
from omero.sys import ParametersI
from omero_parade.utils import get_image_ids

def get_filters():
    return ["Rating", "ROI_count"]

def get_script(request, script_name, conn):
    """Return a JS function to filter images by various params."""
    plate_id = request.GET.get('plate')
    field_id = request.GET.get('field')
    img_ids = get_image_ids(conn, plate_id, field_id)
    query_service = conn.getQueryService()

    if script_name == "Rating":

        params = ParametersI()
        params.addIds(img_ids)
        query = """select oal from ImageAnnotationLink as oal
            join fetch oal.details.owner
            left outer join fetch oal.child as ch
            left outer join fetch oal.parent as pa
            where pa.id in (:ids) and ch.class=LongAnnotation 
            and ch.ns='openmicroscopy.org/omero/insight/rating'"""
        links = query_service.findAllByQuery(query, params, conn.SERVICE_OPTS)
        ratings = {}
        for l in links:
            ratings[l.parent.id.val] = l.child.longValue.val

        # Return a JS function that will be passed an object e.g. {'type': 'Image', 'id': 1}
        # and should return true or false
        f = """(function filter(data, target) {
            var ratings = %s;
            return (ratings[data.id] == target);
        })
        """ % json.dumps(ratings)

        filter_params = [{'type': 'text',
                          'values': ['--', '1', '2', '3', '4', '5']}]
        return JsonResponse(
            {
                'f': f,
                'params': filter_params,
            })

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

        # Return a JS function that will be passed an object e.g. {'type': 'Image', 'id': 1}
        # and should return true or false
        f = """(function filter(data, limit) {
            var roi_counts = %s;
            return (roi_counts[data.id] > limit);
        })
        """ % json.dumps(roi_counts)

        filter_params = [{'type': 'number',
                          'title': '%s-%s' % (min_count, max_count)}]
        return JsonResponse(
            {
                'f': f,
                'params': filter_params,
            })
