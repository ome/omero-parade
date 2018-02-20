
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

def get_well_ids(conn, plate_id):
    """Get well IDs for Plate"""
    conn.SERVICE_OPTS.setOmeroGroup('-1')
    query_service = conn.getQueryService()
    params = ParametersI()
    params.addId(plate_id)
    query = "select well.id "\
            "from Well well "\
            "where well.plate.id = :id"
    p = query_service.projection(query, params, conn.SERVICE_OPTS)
    return [i[0].val for i in p]

def get_well_image_ids(conn, plate_id, field_id=0):
    """Get dict of {wellId: imageId} for Plate"""
    
    conn.SERVICE_OPTS.setOmeroGroup('-1')
    query_service = conn.getQueryService()
    params = ParametersI()
    params.addId(plate_id)
    params.add('wsidx', rint(field_id))
    query = "select well.id, img.id "\
            "from Well well "\
            "join well.wellSamples ws "\
            "join ws.image img "\
            "where well.plate.id = :id "\
            "and index(ws) = :wsidx"
    p = query_service.projection(query, params, conn.SERVICE_OPTS)
    img_ids = {}
    for i in p:
        well_id = i[0].val
        img_id = i[1].val
        img_ids[well_id] = img_id
    return img_ids
