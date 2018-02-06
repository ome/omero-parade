from omero.rtypes import rint
from django.http import JsonResponse
import json
from omero.sys import ParametersI
from omero_parade.utils import get_image_ids

def get_filters(request, conn):
    return ["Rating", "Comment", "Tag"]

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
        f = """(function filter(data, params) {
            var ratings = %s;
            return (params.rating === '-' || ratings[data.id] == params.rating);
        })
        """ % json.dumps(ratings)

        filter_params = [{'name': 'rating',
                          'type': 'text',
                          'values': ['-', '1', '2', '3', '4', '5'],
                          'default': '-',
                          }]
        return JsonResponse(
            {
                'f': f,
                'params': filter_params,
            })

    if script_name == "Comment":

        params = ParametersI()
        params.addIds(img_ids)
        query = """select oal from ImageAnnotationLink as oal
            left outer join fetch oal.child as ch
            left outer join oal.parent as pa
            where pa.id in (:ids) and ch.class=CommentAnnotation"""
        links = query_service.findAllByQuery(query, params, conn.SERVICE_OPTS)
        comments = {}
        for l in links:
            iid = l.parent.id.val
            if iid not in comments:
                comments[iid] = ""
            comments[iid] = " ".join([comments[iid], l.child.textValue.val])

        # Return a JS function that will be passed a data object e.g. {'type': 'Image', 'id': 1}
        # and a params object of {'paramName': value}
        # and should return true or false
        f = """(function filter(data, params) {
            var comments = %s;
            return (params.comment === '' || (comments[data.id] && comments[data.id].indexOf(params.comment) > -1));
        })
        """ % json.dumps(comments)

        filter_params = [{'name': 'comment',
                          'type': 'text',
                          'default': '',
                          }]
        return JsonResponse(
            {
                'f': f,
                'params': filter_params,
            })
    
    if script_name == "Tag":

        params = ParametersI()
        params.addIds(img_ids)
        query = """select oal from ImageAnnotationLink as oal
            left outer join fetch oal.child as ch
            left outer join oal.parent as pa
            where pa.id in (:ids) and ch.class=TagAnnotation"""
        links = query_service.findAllByQuery(query, params, conn.SERVICE_OPTS)
        tags = {}
        all_tags = []
        for l in links:
            iid = l.parent.id.val
            text = l.child.textValue.val
            all_tags.append(text)
            if iid not in tags:
                tags[iid] = []
            tags[iid].append(text)
        
        # remove duplicates
        all_tags = list(set(all_tags))

        # Return a JS function that will be passed a data object e.g. {'type': 'Image', 'id': 1}
        # and a params object of {'paramName': value}
        # and should return true or false
        f = """(function filter(data, params) {
            var tags = %s;
            return (params.tag === 'Choose_Tag' || (tags[data.id] && tags[data.id].indexOf(params.tag) > -1));
        })
        """ % json.dumps(tags)


        all_tags.insert(0, "Choose_Tag")

        filter_params = [{'name': 'tag',
                          'type': 'text',
                          'default': "Choose_Tag",
                          'values': all_tags,
                          }]
        return JsonResponse(
            {
                'f': f,
                'params': filter_params,
            })
