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

from django.http import JsonResponse
import json
from omero.sys import ParametersI
from omero_parade.utils import get_well_ids, get_project_image_ids


def get_filters(request, conn):
    return ["Rating", "Comment", "Tag"]


def get_script(request, script_name, conn):
    """Return a JS function to filter images by various params."""
    project_id = request.GET.get('project')
    dataset_id = request.GET.get('dataset')
    plate_id = request.GET.get('plate')
    image_ids = request.GET.getlist('image')
    dtype = "Image"
    js_object_attr = "id"
    if project_id:
        obj_ids = get_project_image_ids(conn, project_id)
    elif dataset_id:
        objects = conn.getObjects('Image', opts={'dataset': dataset_id})
        obj_ids = [i.id for i in objects]
    elif plate_id:
        dtype = "Well"
        js_object_attr = "wellId"
        obj_ids = get_well_ids(conn, plate_id)
    else:
        obj_ids = [long(i) for i in image_ids]
    query_service = conn.getQueryService()

    if script_name == "Rating":

        params = ParametersI()
        # Include "-1" so that if we have no object IDs that the query does
        # not fail.  It will not match anything.
        params.addIds([-1] + obj_ids)
        query = """select oal from %sAnnotationLink as oal
            join fetch oal.details.owner
            left outer join fetch oal.child as ch
            left outer join fetch oal.parent as pa
            where pa.id in (:ids) and ch.class=LongAnnotation
            and ch.ns='openmicroscopy.org/omero/insight/rating'""" % dtype
        links = query_service.findAllByQuery(query, params, conn.SERVICE_OPTS)
        ratings = {}
        for l in links:
            ratings[l.parent.id.val] = l.child.longValue.val

        # Return a JS function that will be passed an object
        # e.g. {'type': 'Image', 'id': 1}
        # and should return true or false
        f = """(function filter(data, params) {
            var ratings = %s;
            var index = ratings[data.%s] == params.rating
            return (params.rating === '-' || index);
        })
        """ % (json.dumps(ratings), js_object_attr)

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
        # Include "-1" so that if we have no object IDs that the query does
        # not fail.  It will not match anything.
        params.addIds([-1] + obj_ids)
        query = """select oal from %sAnnotationLink as oal
            left outer join fetch oal.child as ch
            left outer join oal.parent as pa
            where pa.id in (:ids) and ch.class=CommentAnnotation""" % dtype
        links = query_service.findAllByQuery(query, params, conn.SERVICE_OPTS)
        comments = {}
        for l in links:
            iid = l.parent.id.val
            if iid not in comments:
                comments[iid] = ""
            comments[iid] = " ".join([comments[iid], l.child.textValue.val])

        # Return a JS function that will be passed a data object
        # e.g. {'type': 'Image', 'id': 1}
        # and a params object of {'paramName': value}
        # and should return true or false
        f = """(function filter(data, params) {
            var comments = %s;
            var index = comments[data.%s] &&
                    comments[data.%s].indexOf(params.comment) > -1
            return (params.comment === '' || index);
        })
        """ % (json.dumps(comments), js_object_attr, js_object_attr)

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
        # Include "-1" so that if we have no object IDs that the query does
        # not fail.  It will not match anything.
        params.addIds([-1] + obj_ids)
        query = """select oal from %sAnnotationLink as oal
            left outer join fetch oal.child as ch
            left outer join oal.parent as pa
            where pa.id in (:ids) and ch.class=TagAnnotation""" % dtype
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

        # Return a JS function that will be passed a data object
        # e.g. {'type': 'Image', 'id': 1}
        # and a params object of {'paramName': value}
        # and should return true or false
        f = """(function filter(data, params) {
            var tags = %s;
            var index = tags[data.%s] && tags[data.%s].indexOf(params.tag) > -1
            return (params.tag === 'Choose_Tag' ||  index);
        })
        """ % (json.dumps(tags), js_object_attr, js_object_attr)

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
