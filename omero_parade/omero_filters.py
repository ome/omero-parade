
from omero.sys import ParametersI
from omero.rtypes import rint
from django.http import JsonResponse
import json


def get_filters():
    return ["tables", "ROI_count"]

def get_script(request, script_name, conn):

    if script_name == "ROI_count":

        plate_id = request.GET.get('plate')
        field_id = request.GET.get('field')

        # Want to get ROI count for images in plate
        conn.SERVICE_OPTS.setOmeroGroup('-1')
        query_service = conn.getQueryService()
        params = ParametersI()
        params.addId(plate_id)
        params.add('wsidx', rint(field_id))
        query = "select img.id "\
                "from Well well "\
                "join well.wellSamples ws "\
                "join ws.image img "\
                "where well.plate.id = :id "\
                "and index(ws) = :wsidx"
        p = query_service.projection(query, params, conn.SERVICE_OPTS)
        img_ids = [i[0].val for i in p]

        # Get ROI counts
        params = ParametersI()
        params.addIds(img_ids)
        query = "select roi.image.id, count(roi.id) from Roi roi "\
                "where roi.image.id in (:ids) group by roi.image"
        p = query_service.projection(query, params)
        # Can't get query count() to work - Just get image IDs
        # (where ROI count > 0)
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
