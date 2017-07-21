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

var search = (req, res, next) => {
    var search = ''
    if(req.params.search){
        search = req.params.search
    }
    var page = parseInt(req.query.page, 0)
    var limit = parseInt(req.query.limit, 0)
    var user_id = req.query.user_id

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    }

    if(!req.user.is_admin && req.user.user_id != user_id ){
        user_id = req.user.user_id
    }

    if(user_id.length){
        user_id = parseInt(user_id, 0)
    }else{
        user_id = '%'
    }

    ProductsModel.countProduct(search, user_id, (count_product) => {
        if (count_product instanceof Error) {
            send.status = Enum.res_type.FAILURE;
            send.message = 'Failed search an product';
            return res.json(send);
        }

        ProductsModel.searchProduct(search, user_id, page*limit, limit, (result) => {
            if (result instanceof Error) {
                send.status = Enum.res_type.FAILURE;
                send.message = 'Failed search an product';
                return res.json(send);
            }

            send.status = Enum.res_type.SUCCESS
            send.info = result
            send.pageinfo = {page: page, limit: limit, count: count_product.count}
            return res.json(send)
        });
    });
};

router.route('/list/:search').get(search)
router.route('/list/').get(search)

// var count = (req, res, next) => {
//     var search = ''
//     if(req.params.search){
//         search = req.params.search
//     }
//     var user_id = req.query.user_id
//
//     var send = {
//         status: Enum.res_type.FAILURE,
//         info: {}
//     }
//
//     if(user_id.length){
//         user_id = parseInt(user_id, 0)
//     }else{
//         user_id = '%'
//     }
//
//     ProductsModel.countProduct(search, user_id, (result) => {
//         if (result instanceof Error) {
//             send.status = Enum.res_type.FAILURE;
//             send.message = 'Failed search an product';
//             return res.json(send);
//         }
//
//         send.status = Enum.res_type.SUCCESS
//         send.info = result
//         return res.json(send)
//     });
// }
// router.route('/count/:search').get(count)
// router.route('/count/').get(count)

router.route('/:id/image/:image_id').delete((req, res, next) => {
    var id = req.params.id
    var image_id = req.params.image_id

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    }

    ProductsModel.detailProduct(id, (old_product) => {
        if (old_product instanceof Error) {
            send.status = Enum.res_type.FAILURE;
            send.info = old_product
            send.message = 'Not found product.'
            return res.json(send);
        }

        if (old_product.user_id == req.user.user_id) {

        } else if (!req.user.is_admin) {
            return res.json({status: Enum.res_type.FAILURE, info: {}, message: 'Not is admin.'})
        } else {

        }

        ProductsModel.deleteImage(id, image_id, (result) => {
            if (result == null) {
                send.status = Enum.res_type.FAILURE
                send.message = 'file not found'
                return res.json(send)
            } else if (result instanceof Error) {
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

router.route('/:id/image').post((req, res, next) => {
    var id = req.params.id

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    }

    console.log

    if(!req.files || !req.files.image){
        send.message = 'File not found.'
        return res.json(send)
    }

    ProductsModel.detailProduct(id, (old_product) => {
        if (old_product instanceof Error) {
            send.status = Enum.res_type.FAILURE;
            send.info = old_product
            send.message = 'Not found product.'
            return res.json(send);
        }

        if (old_product.user_id == req.user.user_id) {

        } else if (!req.user.is_admin) {
            return res.json({status: Enum.res_type.FAILURE, info: {}, message: 'Not is admin.'})
        } else {

        }

        FileModel.saveFile(req.files.image, (result) => {
            if (result == null) {
                send.status = Enum.res_type.FAILURE
                send.message = 'file not found'
                return res.json(send)
            }

            ProductsModel.addImage(id, result.fid, req.files.image.name, 0, (result) => {
                if (result == null) {
                    send.status = Enum.res_type.FAILURE
                    send.message = 'file not found'
                    return res.json(send)
                } else if (result instanceof Error) {
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
            },
            'subcategory': {
                'type': 'string'
            },
            'subcategory_code': {
                'type': 'string'
            },
            'user_id': {
                'type': 'string'
            }
        },
        'required': [
            'title', 'sku', 'category', 'price'
        ]
    }

    var valid = ajv.validate(schema, data)
    if (!valid)
        return res.json({status: Enum.res_type.FAILURE, info:ajv.errors, message: 'bad request.'})

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    }

    var user_id = ''
    if(data.user_id){
        user_id = data.user_id

        if(user_id == req.user.user_id){

        }else if(!req.user.is_admin){
            return res.json({status: Enum.res_type.FAILURE, info:{}, message: 'Not is admin.'})
        }else{

        }

    }else{
        user_id = req.user.user_id
    }

    ProductsModel.addProduct(data, user_id, req.user.user_id, (result) => {
        if (result instanceof Error) {
            send.status = Enum.res_type.FAILURE;
            send.info = result;
            send.message = 'รหัสสินค้านี้ถูกใช้งานแล้วกรุณาตรวจสอบ'
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
            },
            'subcategory': {
                'type': 'string'
            },
            'subcategory_code': {
                'type': 'string'
            }
        },
        'required': [
            // 'title', 'sku', 'category', 'price'
        ]
    }
    var valid = ajv.validate(schema, data)
    if (!valid)
        return res.json({status: Enum.res_type.FAILURE, info:ajv.errors, message: 'bad request.'})

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    }

    ProductsModel.detailProduct(id, (old_product) => {
        if (old_product instanceof Error) {
            send.status = Enum.res_type.FAILURE;
            send.info = old_product
            send.message = 'Not found product.'
            return res.json(send);
        }

        if(old_product.user_id == req.user.user_id){

        }else if(!req.user.is_admin){
            return res.json({status: Enum.res_type.FAILURE, info:{}, message: 'Not is admin.'})
        }else{

        }

        ProductsModel.updateProduct(id, data, req.user.user_id, (result) => {
            if (result instanceof Error) {
                send.status = Enum.res_type.FAILURE;
                send.info = result
                send.message = 'รหัสสินค้านี้ถูกใช้งานแล้วกรุณาตรวจสอบ'
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
    })
});

router.route('/:id').get((req, res, next) => {
    var id = req.params.id

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    }

    ProductsModel.detailProduct(id, (product) => {
        if (product instanceof Error) {
            send.status = Enum.res_type.FAILURE;
            send.message = product;
            return res.json(send);
        }

        if (product.user_id == req.user.user_id) {

        } else if (!req.user.is_admin) {
            return res.json({status: Enum.res_type.FAILURE, info: {}, message: 'Not is admin.'})
        } else {

        }

        ProductsModel.getImages(id, (result_images) => {
            if (result_images instanceof Error) {
                send.status = Enum.res_type.FAILURE;
                send.message = result_images
                return res.json(send);
            }

            product.images = result_images;

            ProductsModel.getEmarket(id, (result_emarket) => {
                if (result_emarket instanceof Error) {
                    send.status = Enum.res_type.FAILURE;
                    send.message = result_emarket
                    return res.json(send);
                }

                product.using_platforms = result_emarket

                send.status = Enum.res_type.SUCCESS
                send.info = product;
                return res.json(send)
            })
        })
    });
});

router.route('/:id').delete((req, res, next) => {
    var id = req.params.id

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    }

    ProductsModel.detailProduct(id, (old_product) => {
        if (old_product instanceof Error) {
            send.status = Enum.res_type.FAILURE;
            send.info = old_product
            send.message = 'Not found product.'
            return res.json(send);
        }

        if (old_product.user_id == req.user.user_id) {

        } else if (!req.user.is_admin) {
            return res.json({status: Enum.res_type.FAILURE, info: {}, message: 'Not is admin.'})
        } else {

        }

        ProductsModel.deleteProduct(id, req.user.user_id, (result) => {
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
});

export default router
