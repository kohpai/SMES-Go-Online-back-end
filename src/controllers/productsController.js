'use strict'

// package
import { Router } from 'express'
const router = new Router()
import Ajv from 'ajv'
const ajv = new Ajv()

var request = require("request")

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
                'type': 'string'
            },
            'barcode': {
                'type': 'string'
            },
            'description': {
                'type': 'string'
            },
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
            send.message = 'Failed adding an product';
            send.hint = 'MySQL error: '+ result.sqlMessage;
            console.log('The SQL stattement')
            console.log(result.sql);
            return res.json(send);
        }

        send.status = Enum.res_type.SUCCESS
        send.info = {id: result};
        return res.json(send)
    });
});

router.route('/send_sms').post((req, res, next) => {
    var data = req.body
    console.log(req.body)
    var schema = {
        'additionalProperties': false,
        'properties': {
            'phone_number': {
                'type': 'string'
            },
            'message': {
                'type': 'string'
            }
        },
        'required': [ 'phone_number', 'message' ]
    }
    var valid = ajv.validate(schema, data)
    if (!valid) return HttpStatus.send(res, 'BAD_REQUEST', { message: Util.toAjvResponse(ajv.errors) })

    var message = data.message.toString("utf8")

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    }

    var options = {
        method: 'POST',
        url: 'http://corpsms.dtac.co.th/servlet/com.iess.socket.SmsCorplink',
        headers: { 'cache-control': 'no-cache' },
        body: 'RefNo=10000000'+'&Msn='+data.phone_number+'&Msg='+message+'&Encoding=0'+'&MsgType=T'+'&User=api1618871'+'&Password=Dtac2016'+'&Sender=SMEs Go'

    };

    console.log(options)

    request(options, function (error, response, body) {
        if (error){
            send.status = Enum.res_type.FAILURE
            send.message = error
            return res.json(send)
        }
        send.status = Enum.res_type.SUCCESS
        send.message = response.body
        return res.json(send)
    });

    //body: 'RefNo=10000000'+'&Msn='+data.phone_number+'&Msg='+message+'&Encoding=0'+'&MsgType=T'+'&User=api1618871'+'&Password=Dtac2016'+'&Sender=SMEs Go'

})

router.route('/upload_file').post((req, res, next) => {

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    }

    FileModel.saveFile(req.files.file, (result) => {
        if(result == null){
            send.status = 'fail'
            send.message = 'file not found'
            return res.json(send)
        }
        send.status = 'success'
        send.message = result
        return res.json(send)
    })
})

export default router
