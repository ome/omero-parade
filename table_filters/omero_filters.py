from omero.rtypes import rint
from django.http import JsonResponse
import json
from omero.sys import ParametersI
from omero.constants.namespaces import NSBULKANNOTATIONS
from omero.model import OriginalFileI

def get_filters(request, conn):
    return ["Table"]

def get_script(request, script_name, conn):
    """Return a JS function to filter images by various params."""
    plate_id = request.GET.get('plate')
    query_service = conn.getQueryService()

    if script_name == "Table":

        params = ParametersI()
        params.addId(plate_id)
        query = """select oal from PlateAnnotationLink as oal
            left outer join fetch oal.child as ch
            left outer join oal.parent as pa
            where pa.id=:id
            and ch.ns='%s'""" % NSBULKANNOTATIONS
        links = query_service.findAllByQuery(query, params, conn.SERVICE_OPTS)
        shared_resources = conn.getSharedResources()
        # Just use the first Table we find
        # TODO: handle multiple tables!?
        file_id = links[0].child.file.id.val

        table = shared_resources.openTable(OriginalFileI(file_id), conn.SERVICE_OPTS)
        if not table:
            return JsonResponse({'ERROR': 'Failed to open table'})

        headers = table.getHeaders()
        rows = table.getNumberOfRows()

        column_names = [col.name for col in headers]
        col_data = table.read(range(len(headers)), 0, rows).columns

        table_data = {}
        for name, col in zip(column_names, col_data):
            # key is column Name, values are list of col_data
            table_data[name] = col.values

        # Return a JS function that will be passed an object e.g. {'type': 'Image', 'id': 1}
        # and should return true or false
        f = """(function filter(data, params) {
            if (isNaN(params.count) || params.count == '') return true;
            var table_data = %s;
            var rowIndex = table_data.Well.indexOf(data.wellId);
            var value = table_data[params.column_name][rowIndex];
            if (params.operator === '=') return value == params.count;
            if (params.operator === '<') return value < params.count;
            if (params.operator === '>') return value > params.count;
        })
        """ % json.dumps(table_data)

        filter_params = [{'name': 'column_name',
                          'type': 'text',
                          'values': column_names[1:],   # 1st column is Well
                          'default': column_names[1],},
                         {'name': 'operator',
                          'type': 'text',
                          'values': ['>', '=', '<'],
                          'default': '>'},
                         {'name': 'count',
                          'type': 'number',
                          'default': ''}]
        return JsonResponse(
            {
                'f': f,
                'params': filter_params,
            })
