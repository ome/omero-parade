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

    if script_name == "ROI_count":
        # Want to get ROI count for images in plate

        # Get ROI counts
        params = ParametersI()
        params.addIds(img_ids)
        query = "select roi.image.id, count(roi.id) from Roi roi "\
                "where roi.image.id in (:ids) group by roi.image"
        p = query_service.projection(query, params)
        roi_counts = {}
        for i in p:
            roi_counts[i[0].val] = i[1].val

        # Return a JS function that will be passed an object e.g. {'type': 'Image', 'id': 1}
        # and should return true or false
        f = """(function filter(data, limit) {
            var roi_counts = %s;
            return (roi_counts[data.id] > limit);
        })
        """ % json.dumps(roi_counts)

        filterParams = [{'type': 'number'}]
        return JsonResponse(
            {
                'f': f,
                'params': filterParams,
            })
