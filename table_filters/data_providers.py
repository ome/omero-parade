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

from omero.sys import ParametersI
from omero.constants.namespaces import NSBULKANNOTATIONS
from omero.model import OriginalFileI
from omero_parade.utils import get_well_image_ids


def get_dataproviders(request, conn):
    # Can provide data from any table column
    plate_id = request.GET.get('plate', None)
    if plate_id is None:
        return []

    query_service = conn.getQueryService()
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
    table = shared_resources.openTable(OriginalFileI(file_id),
                                       conn.SERVICE_OPTS)
    column_names = [col.name for col in table.getHeaders()]
    return ["Table_%s" % c for c in column_names]


def get_data(request, data_name, conn):
    """Return table data for images in a Plate."""
    plate_id = request.GET.get('plate')
    field_id = request.GET.get('field')

    # dict of well_id: img_id
    img_ids = get_well_image_ids(conn, plate_id, field_id)
    print 'img_ids', img_ids
    query_service = conn.getQueryService()

    if data_name.startswith("Table_"):
        column_name = data_name.replace("Table_", "")

        # Load table and get data for named column
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

        table = shared_resources.openTable(OriginalFileI(file_id),
                                           conn.SERVICE_OPTS)
        headers = table.getHeaders()
        column_names = [col.name for col in headers]
        col_index = column_names.index(column_name)
        rows = table.getNumberOfRows()

        # Load first column 'Well' & named column
        col_data = table.read([0, col_index], 0, rows).columns

        table_data = {}
        well_ids = col_data[0].values
        values = col_data[1].values
        for well_id, value in zip(well_ids, values):
            print 'well_id', well_id, value
            img_id = img_ids[well_id]
            table_data[img_id] = value

        return table_data
