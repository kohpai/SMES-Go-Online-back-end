'use strict'

// package
import { Router } from 'express'
const router = new Router()
import Ajv from 'ajv'
const ajv = new Ajv()

// using
import HttpStatus from './../helper/http_status.js'
import ProductsModel from '../models/productsModel.js'
import ImportModel from '../models/importModel.js'
import UsersModel from '../models/usersModel.js'
import { Util, Enum } from '../helper'
import FileModel from '../models/fileModel.js'

var fs = require('fs')
var path = require("path")
var csv = require("fast-csv");

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

    if(!req.files || !req.files.image){
        send.status = Enum.res_type.FAILURE
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

router.route('/import/:id').post((req, res, next) => {
    var id = req.params.id
    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    }

    if(!req.user.is_admin){
        return res.json({status: Enum.res_type.FAILURE, info:{}, message: 'Not is admin.'})
    }

    if(!req.files || !req.files.file){
        send.status = Enum.res_type.FAILURE
        send.message = 'File not found.'
        return res.json(send)
    }

    UsersModel.detailUser(id, (user) => {
        if(user instanceof Error){
            send.status = Enum.res_type.FAILURE
            send.message = 'User not found.'
            return res.json(send)
        }

        FileModel.unzipFile(req.files.file, (zip) => {
            if(zip == null){
                send.status = Enum.res_type.FAILURE
                send.message = 'File not found.'
                return res.json(send)
            }

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

            var i = 0
            var ts = new Date().getTime()

            console.log(zip+'/products.csv')

            csv.fromPath(zip+'/products.csv')
                .on("data", function(data){

                    var position = i
                    var status_message = ''
                    var status_info = {}

                    if(position == 0 || position == 1){

                    }else{
                        var isError = false

                        var title = ''
                        if(!isError){
                            if(data[0].length){
                                title = data[0]
                            }else{
                                isError = true
                                status_message = 'title not empty'
                            }
                        }

                        var sku = ''
                        if(!isError){
                            if(data[1].length){
                                sku = data[1]
                            }else{
                                isError = true
                                status_message = 'sku not empty'
                            }
                        }

                        var category = ''
                        if(!isError){
                            if(data[3].length){
                                category = data[3]
                            }else{
                                isError = true
                                status_message = 'category not empty'
                            }
                        }

                        var price = 0
                        if(!isError){
                            var parsePrice = parseFloat(data[8])
                            if(!isNaN(parsePrice)){
                                price = parsePrice
                            }else{
                                isError = true
                                status_message = 'price not empty or price number'
                            }
                        }

                        if(!isError){

                            var d = {
                                title: title,
                                sku: sku,
                                unspsc: data[2],
                                category: data[3],
                                no_of_pieces: data[6],
                                price: price,
                                barcode: data[7],
                                description: data[10],
                                amount: parseInt(data[9]),
                                cert_q: data[11],
                                cert_food_and_drug: data[12],
                                cert_iso: data[13],
                                cert_halan: data[14],
                                cert_organic: data[15],
                                cert_safefood: data[16],
                                cert_other: data[17],
                                //using_platforms: data.using_platforms,
                                subcategory: data[4],
                                subcategory_code: data[5],
                                user_id: id,
                            }

                            var valid = ajv.validate(schema, d)
                            if (!valid){
                                isError = true
                                status_message = title+', '+sku+' : '+'bad request'

                                console.log(ajv.errors)

                                // update import detail
                                ImportModel.addImportDetail(ts, position, status_message, ajv.errors, (result) => {})

                            }else{
                                ProductsModel.addProduct(d, id, req.user.user_id, (result_product) => {
                                    if (result_product instanceof Error) {
                                        isError = true
                                        status_message = title+', '+sku+' : '+' : '+'fail'

                                        // update import detail
                                        ImportModel.addImportDetail(ts, position, status_message, result_product, (result) => {})

                                    }else{
                                        isError = false
                                        status_message = title+', '+sku+' : '+' : '+'success'

                                        // update import detail
                                        ImportModel.addImportDetail(ts, position, status_message, null, (result) => {})

                                        // upload image
                                        for(var j = 18; j <= 26; j++){
                                            if(data[j].length){
                                                var position = j
                                                FileModel.saveFilePath(zip+'/'+data[position], (weed_info) => {
                                                    if (weed_info == null) {

                                                    }else{
                                                        ProductsModel.addImage(result_product.insertId, weed_info.fid, data[position], 0, (result) => {
                                                            if (result == null) {

                                                            } else if (result instanceof Error) {

                                                            }else{

                                                            }
                                                        })
                                                    }
                                                })
                                            }
                                        }

                                    }
                                });

                            }
                        }else{

                            status_message = title+', '+sku+' : '+status_message

                            // update import detail
                            ImportModel.addImportDetail(ts, position, status_message, null, (result) => {})
                        }
                    }

                    i++
                })
                .on("end", function(){
                    ImportModel.addImport(ts, 2, req.files.file.name, req.user.user_id, (result) => {
                        if(result instanceof Error){
                            send.status = Enum.res_type.FAILURE
                            send.message = 'can\'t add import'
                            return res.json(send)
                        }

                        send.status = Enum.res_type.SUCCESS
                        send.info = { import_id: ts }
                        return res.json(send)
                    })

                })
        })

    })
})

export default router
