'use strict'

// package
import { Router } from 'express'
const router = new Router()
import Ajv from 'ajv'
const ajv = new Ajv()

// using
import HttpStatus from './../helper/http_status.js'
import CountryModel from '../models/countryModel.js'
import { Util, Enum } from '../helper'


/* further work
   - catch error
   */
router.route('/province').get((req, res, next) => {

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    }

    CountryModel.getProvinces((provinces) => {
        if (provinces == null) {
            send.message = 'not found provinces';
            return res.json(send);
        }else if(provinces instanceof Error){
            send.message = 'error province';
            return res.json(send);
        }
        send.status = Enum.res_type.SUCCESS;
        send.info = {provinces: provinces};
        return res.json(send)
    })

});

router.route('/amphoe/:id').get((req, res, next) => {
    var data = {province_id: req.params.id};
    var schema = {
        'additionalProperties': false,
        'properties': {
            'province_id': {
                'type': 'string'
            }
        },
        'required': [ 'province_id' ]
    };
    var valid = ajv.validate(schema, data)
    if (!valid) return HttpStatus.send(res, 'BAD_REQUEST', { message: Util.toAjvResponse(ajv.errors) })

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    }

    CountryModel.getAmphoes(data.province_id, (amphoes) => {
        if (amphoes == null) {
            send.message = 'not found amphoes';
            return res.json(send);
        }else if(amphoes instanceof Error){
            send.message = 'error amphoes';
            return res.json(send);
        }
        send.status = Enum.res_type.SUCCESS;
        send.info = {amphoes: amphoes};
        return res.json(send)
    })

});

router.route('/tambon/:id').get((req, res, next) => {
    var data = {tambon_id: req.params.id};
    var schema = {
        'additionalProperties': false,
        'properties': {
            'tambon_id': {
                'type': 'string'
            }
        },
        'required': [ 'tambon_id' ]
    };
    var valid = ajv.validate(schema, data)
    if (!valid) return HttpStatus.send(res, 'BAD_REQUEST', { message: Util.toAjvResponse(ajv.errors) })

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    }

    CountryModel.getTambons(data.tambon_id, (tambon) => {
        if (tambon == null) {
            send.message = 'not found tambon';
            return res.json(send);
        }else if(tambon instanceof Error){
            send.message = 'error tambon';
            return res.json(send);
        }
        send.status = Enum.res_type.SUCCESS;
        send.info = {tambons: tambon};
        return res.json(send)
    })

});

export default router
