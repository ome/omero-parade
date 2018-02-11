
from django.http import JsonResponse
import json
from omero.sys import ParametersI
from omero.rtypes import rint
from omero_parade.utils import get_image_ids


def get_dataproviders(request, conn):
    return ["ROI_count"]


def get_data(request, data_name, conn):
    """Return data for images in a Dataset or Plate."""
    dataset_id = request.GET.get('dataset')
    plate_id = request.GET.get('plate')
    field_id = request.GET.get('field')
    if plate_id and field_id:
        img_ids = get_image_ids(conn, plate_id, field_id)
    elif dataset_id:
        img_ids = [i.id for i in conn.getObjects('Image', opts={'dataset': dataset_id})]
    query_service = conn.getQueryService()

    if data_name == "ROI_count":
        # Want to get ROI count for images
        params = ParametersI()
        params.addIds(img_ids)
        query = "select roi.image.id, count(roi.id) from Roi roi "\
                "where roi.image.id in (:ids) group by roi.image"
        p = query_service.projection(query, params, conn.SERVICE_OPTS)
        roi_counts = {}
        for i in p:
            roi_counts[i[0].val] = i[1].val
        
        return roi_counts