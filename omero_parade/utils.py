
from omero.sys import ParametersI
from omero.rtypes import rint

def get_image_ids(conn, plate_id, field_id=0):
    """Get image IDs for images in Plate"""
    
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
    return img_ids
