'use strict'

// package
import { Router } from 'express'
const router = new Router()
import Ajv from 'ajv'
const ajv = new Ajv()

// using
import HttpStatus from './../helper/http_status.js'
import UsersModel from '../models/usersModel.js'
import { Util, Enum } from '../helper'


/* further work
   - catch error
   */
router.route('/info').post((req, res, next) => {
    // try {
    var data = req.body
    var schema = {
        "additionalProperties": false,
        "properties": {
            "user_id": {
                "type": "string"
            }
        },
        "required": [ "user_id" ]
    }
    var valid = ajv.validate(schema, data)
    if (!valid)
        return HttpStatus.send(res, 'BAD_REQUEST', { message: Util.toAjvResponse(ajv.errors) })

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    }

    UsersModel.getUserById(data.user_id, (user) => {
        if (user == null){
            send.status = Enum.res_type.FAILURE;
            send.message = 'unknow user_id '+data.user_id;
            return res.json(send);
        }

        send.status = Enum.res_type.SUCCESS;
        send.info = Object.assign({}, user);

        return res.json(send);

    })
    // }
    // catch(error){
    //   return HttpStatus.send(res, 'INTERNAL_SERVER_ERROR')
    // }
})

router.route('/add').post((req, res, next) => {
    // try {
    var data = req.body
    var schema = {
        "additionalProperties": false,
        "properties": {
            "sme_id": {
                "type": "string"
            },
            "first_name": {
                "type": "string"
            },
            "last_name": {
                "type": "string"
            },
            "citizen_id": {
                "type": "string"
            },
            "phone_no": {
                "type": "string"
            },
            "email": {
                "type": "string"
            },
            "job": {
                "type": "string"
            },
            "ecom_do_own": {
                "type": "number"
            },
            "ecom_category": {
                "type": "string"
            },
            "know_estda": {
                "type": "number"
            },
            "house_no": {
                "type": "string"
            },
            "village_no": {
                "type": "string"
            },
            "alley": {
                "type": "string"
            },
            "village_title": {
                "type": "string"
            },
            "road": {
                "type": "string"
            },
            "province": {
                "type": "string"
            },
            "district": {
                "type": "string"
            },
            "subdistrict": {
                "type": "string"
            },
            "postal_code": {
                "type": "string"
            },
            "scholar": {
                "type": "number"
            },
            "needed_help": {
                "type": "array"
            },
            "intended_sme_proj": {
                "type": "array"
            },
            "participated_sme_proj": {
                "type": "array"
            },
        },
        "required": [
            "first_name", "last_name", "citizen_id", "phone_no",
            "house_no", "province", "district", "subdistrict", "postal_code"
        ]
    }
    var valid = ajv.validate(schema, data)
    if (!valid)
        return HttpStatus.send(res, 'BAD_REQUEST', { message: Util.toAjvResponse(ajv.errors) })

    // var query = {
    //     sme_id: data.sme_id,
    //     first_name: data.first_name,
    //     last_name: data.last_name,
    //     citizen_id: data.citizen_id,
    //     phone_no: data.phone_no,
    //     email: data.email,
    //     job: data.job,
    //     ecom_do_own: data.ecom_do_own,
    //     ecom_category: data.ecom_category,
    //     know_estda: data.know_estda,
    //     house_no: data.house_no,
    //     village_no: data.village_no,
    //     alley: data.alley,
    //     village_title: data.village_title,
    //     road: data.road,
    //     province: data.province,
    //     district: data.district,
    //     subdistrict: data.subdistrict,
    //     postal_code: data.postal_code,
    //     scholar: data.scholar
    // };
    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    }

    UsersModel.addUser(data, (result) => {
        if (result.code) {
            console.log('add user error: ',result);
            send.status = Enum.res_type.FAILURE;
            send.message = 'cannot add user'+ data.user_id;
            send.hint = 'MySQL error: '+ result.code;
            return res.json(send);
        }

        send.status = Enum.res_type.SUCCESS
        send.info = Object.assign({}, result)
        return res.json(send)
    });
})

router.route('/status').post((req, res, next) => {
    // try {
    var data = req.body
    var schema = {
        "additionalProperties": false,
        "properties": {
            "user_id": {
                "type": "string"
            }
        },
        "required": [ "user_id" ]
    }
    var valid = ajv.validate(schema, data)
    if (!valid) return HttpStatus.send(res, 'BAD_REQUEST', { message: Util.toAjvResponse(ajv.errors) })

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    }
    EventStatusModel.getEventStatusByUserId(data.user_id, (event) => {
        if(event == null){
            send.status = Enum.res_type.SUCCESS
            send.message = "First time"
            send.info = {}
            return res.json(send)
        }
        send.status = Enum.res_type.SUCCESS
        delete event._id
        delete event.user_id
        send.info = Object.assign({}, event)
        return res.json(send)
    })
    // }
    // catch(error){
    //   return HttpStatus.send(res, 'INTERNAL_SERVER_ERROR')
    // }
})

export default router
