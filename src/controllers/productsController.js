'use strict'

// package
import { Router } from 'express'
const router = new Router()
import Ajv from 'ajv'
const ajv = new Ajv()

// using
import HttpStatus from './../helper/http_status.js'
import ProductsModel from '../models/productsModel.js'
import { Util, Enum } from '../helper'

import FileModel from '../models/fileModel.js'

const fileUpload = require('express-fileupload')
router.use(fileUpload())


/* further work
   - catch error
   */
var search = (req, res, next) => {
    var search = ''
    if(req.params.search){
        search = req.params.search
    }
    var page = parseInt(req.query.page, 0)
    var limit = parseInt(req.query.limit, 0)
    console.log(page +":"+limit)

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    }

    ProductsModel.searchProduct(search, page*limit, limit, (result) => {
        if (result instanceof Error) {
            send.status = Enum.res_type.FAILURE;
            send.message = 'Failed search an product';
            send.hint = 'MySQL error: '+ result.sqlMessage;
            console.log('The SQL stattement')
            console.log(result.sql);
            return res.json(send);
        }

        send.status = Enum.res_type.SUCCESS
        send.info = result;
        return res.json(send)
    });
};

router.route('/list/:search').get(search);
router.route('/list/').get(search);

router.route('/:id/image/:image_id').delete((req, res, next) => {
    var id = req.params.id
    var image_id = req.params.image_id

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    }

    console.log("/:id/image/:image_id")

    // FileModel.deleteFile(image_id, (result) => {
    //     if(result == null){
    //         send.status = Enum.res_type.FAILURE
    //         send.message = 'file not found'
    //         return res.json(send)
    //     }
    // })

    ProductsModel.deleteImage(id, image_id, (result) => {
        if(result == null){
            send.status = Enum.res_type.FAILURE
            send.message = 'file not found'
            return res.json(send)
        }else if(result instanceof Error){
            send.status = Enum.res_type.FAILURE
            send.message = result
            return res.json(send)
        }
        send.status = 'success'
        send.info = result
        return res.json(send)
    })
})

router.route('/:id/image').post((req, res, next) => {
    var id = req.params.id

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    }

    console.log("/:id/image")

    FileModel.saveFile(req.files.image, (result) => {
        if(result == null){
            send.status = Enum.res_type.FAILURE
            send.message = 'file not found'
            return res.json(send)
        }

        ProductsModel.addImage(id, result.fid, 0, (result) => {
            if(result == null){
                send.status = Enum.res_type.FAILURE
                send.message = 'file not found'
                return res.json(send)
            }else if(result instanceof Error){
                send.status = Enum.res_type.FAILURE
                send.message = result
                return res.json(send)
            }
            send.status = 'success'
            send.info = result
            return res.json(send)
        })
    })
})

router.route('/').post((req, res, next) => {
    var data = req.body
    var schema = {
        'additionalProperties': false,
        'properties': {
            'title': {
                'type': 'string'
            },
            'sku': {
                'type': 'string'
            },
            'unspsc': {
                'type': 'string'
            },
            'category': {
                'type': 'string'
            },
            'no_of_pieces': {
                'type': 'string'
            },
            'price': {
                'type': 'number'
            },
            'barcode': {
                'type': 'string'
            },
            'description': {
                'type': 'string'
            },
            'amount': {
                'type': 'number'
            },
            'cert_q': {
                'type': 'string'
            },
            'cert_food_and_drug': {
                'type': 'string'
            },
            'cert_iso': {
                'type': 'string'
            },
            'cert_halan': {
                'type': 'string'
            },
            'cert_organic': {
                'type': 'string'
            },
            'cert_safefood': {
                'type': 'string'
            },
            'cert_other': {
                'type': 'string'
            },
            'using_platforms': {
                "items": {
                    "type": "string"
                }
            }
        },
        'required': [
            'title', 'sku', 'category', 'price'
        ]
    }

    var valid = ajv.validate(schema, data)
    if (!valid)
        return HttpStatus.send(res, 'BAD_REQUEST', { message: Util.toAjvResponse(ajv.errors) })

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    }

    ProductsModel.addProduct(data, (result) => {
        if (result instanceof Error) {
            send.status = Enum.res_type.FAILURE;
            send.message = result;
            return res.json(send);
        }

        ProductsModel.addEmarket(result.insertId, data.using_platforms, (result) => {

            if (result instanceof Error) {
                send.status = Enum.res_type.FAILURE;
                send.message = result;
                return res.json(send);
            }

            send.status = Enum.res_type.SUCCESS
            send.info = result;
            return res.json(send)

        })
    });
});

router.route('/:id').put((req, res, next) => {
    var id = req.params.id
    var data = req.body
    var schema = {
        'additionalProperties': false,
        'properties': {
            'title': {
                'type': 'string'
            },
            'sku': {
                'type': 'string'
            },
            'unspsc': {
                'type': 'string'
            },
            'category': {
                'type': 'string'
            },
            'no_of_pieces': {
                'type': 'string'
            },
            'price': {
                'type': 'number'
            },
            'barcode': {
                'type': 'string'
            },
            'description': {
                'type': 'string'
            },
            'amount': {
                'type': 'number'
            },
            'cert_q': {
                'type': 'string'
            },
            'cert_food_and_drug': {
                'type': 'string'
            },
            'cert_iso': {
                'type': 'string'
            },
            'cert_halan': {
                'type': 'string'
            },
            'cert_organic': {
                'type': 'string'
            },
            'cert_safefood': {
                'type': 'string'
            },
            'cert_other': {
                'type': 'string'
            },
            'using_platforms': {
                "items": {
                    "type": "string"
                }
            }
        },
        'required': [
            // 'title', 'sku', 'category', 'price'
        ]
    }
    var valid = ajv.validate(schema, data)
    if (!valid)
        return HttpStatus.send(res, 'BAD_REQUEST', { message: Util.toAjvResponse(ajv.errors) })

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    }

    ProductsModel.updateProduct(id, data, (result) => {
        if (result instanceof Error) {
            send.status = Enum.res_type.FAILURE;
            send.message = 'Failed update an product';
            send.hint = 'MySQL error: '+ result.sqlMessage;
            console.log('The SQL stattement')
            console.log(result.sql);
            return res.json(send);
        }

        ProductsModel.deleteEmarket(id, (result_delete) => {
            if (result instanceof Error) {
                send.status = Enum.res_type.FAILURE;
                send.message = result;
                return res.json(send);
            }

            ProductsModel.addEmarket(id, data.using_platforms, (result) => {
                if (result instanceof Error) {
                    send.status = Enum.res_type.FAILURE;
                    send.message = result;
                    return res.json(send);
                }

                send.status = Enum.res_type.SUCCESS
                send.info = result;
                return res.json(send)
            })
        })
    });
});

router.route('/:id').get((req, res, next) => {
    var id = req.params.id

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    }

    console.log("/products/:id")

    ProductsModel.detailProduct(id, (result) => {
        if (result instanceof Error) {
            send.status = Enum.res_type.FAILURE;
            send.message = 'Failed update an product';
            send.hint = 'MySQL error: '+ result.sqlMessage;
            console.log('The SQL stattement')
            console.log(result.sql);
            return res.json(send);
        }

        ProductsModel.getImages(id, (result_images) => {
            if  (result == null){
                send.status = Enum.res_type.FAILURE;
                send.message = "not found"
                return res.json(send);
            }else if (result instanceof Error) {
                send.status = Enum.res_type.FAILURE;
                send.message = result_images
                return res.json(send);
            }

            result.images = result_images;

            send.status = Enum.res_type.SUCCESS
            send.info = result;
            return res.json(send)
        })
    });
});

router.route('/:id').delete((req, res, next) => {
    var id = req.params.id

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    }

    ProductsModel.deleteProduct(id, (result) => {
        if (result instanceof Error) {
            send.status = Enum.res_type.FAILURE;
            send.message = result;
            return res.json(send);
        }

        send.status = Enum.res_type.SUCCESS
        send.info = result;
        return res.json(send)
    });
});

export default router
