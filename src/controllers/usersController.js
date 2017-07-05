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
        'additionalProperties': false,
        'properties': {
            'user_id': {
                'type': 'string'
            }
        },
        'required': [ 'user_id' ]
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

router.route('/').post((req, res, next) => {
    // try {
    var data = req.body
    var schema = {
        'additionalProperties': false,
        'properties': {
            'registration_type': {
                'type': 'string'
            },
            'enterprise_name': {
                'type': 'string'
            },
            'first_name': {
                'type': 'string'
            },
            'last_name': {
                'type': 'string'
            },
            'id_no': {
                'type': 'string'
            },
            'house_no': {
                'type': 'string'
            },
            'village_no': {
                'type': 'string'
            },
            'alley': {
                'type': 'string'
            },
            'village_title': {
                'type': 'string'
            },
            'road': {
                'type': 'string'
            },
            'subdistrict': {
                'type': 'string'
            },
            'district': {
                'type': 'string'
            },
            'province': {
                'type': 'string'
            },
            'postal_code': {
                'type': 'string'
            },
            'phone_no': {
                'type': 'string'
            },
            'email': {
                'type': 'string'
            },
            'line_id': {
                'type': 'string'
            },
            'facebook': {
                'type': 'string'
            },
            'enterprise_type': {
                'type': 'object',
                'minProperties': 1,
                'maxProperties': 5,
                'properties': {
                    'agricultural_product': {
                        'type': 'string'
                    },
                    'industrial_product': {
                        'type': 'string'
                    },
                    'selling': {
                        'type': 'string'
                    },
                    'service': {
                        'type': 'string'
                    },
                    'other': {
                        'type': 'string'
                    }
                }
            },
            'sme_member_no': {
                'type': 'array'
            },
            'needed_help': {
                'type': 'object',
                'minProperties': 1,
                'maxProperties': 7,
                'properties': {
                    'needed_help_ecommerce': {
                        'type': 'boolean'
                    },
                    'needed_help_investor': {
                        'type': 'boolean'
                    },
                    'needed_help_supplier': {
                        'type': 'boolean'
                    },
                    'needed_help_payment': {
                        'type': 'boolean'
                    },
                    'needed_help_logistics': {
                        'type': 'boolean'
                    },
                    'needed_help_online_marketing': {
                        'type': 'boolean'
                    },
                    'needed_help_tax': {
                        'type': 'boolean'
                    }
                }
            },
            'on_ecommerce': {
                'type': 'boolean'
            }
        },
        'required': [
            'registration_type', 'enterprise_name', 'first_name', 'last_name',
            'id_no', 'house_no', 'village_no', 'subdistrict', 'district', 'province',
            'postal_code', 'phone_no', 'enterprise_type', 'needed_help'
        ]
    }
    var valid = ajv.validate(schema, data)
    if (!valid)
        return HttpStatus.send(res, 'BAD_REQUEST', { message: Util.toAjvResponse(ajv.errors) })

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    }

    UsersModel.addUser(data, (result) => {
        if (result instanceof Error) {
            send.status = Enum.res_type.FAILURE;
            send.message = 'Failed adding an user';
            send.hint = 'MySQL error: '+ result.sqlMessage;
            console.log('The SQL stattement')
            console.log(result.sql);
            return res.json(send);
        }

        send.status = Enum.res_type.SUCCESS
        send.info = {id: result};
        return res.json(send)
    });
})

router.route('/status').post((req, res, next) => {
    // try {
    var data = req.body
    var schema = {
        'additionalProperties': false,
        'properties': {
            'user_id': {
                'type': 'string'
            }
        },
        'required': [ 'user_id' ]
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
            send.message = 'First time'
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
