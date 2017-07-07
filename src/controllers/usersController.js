'use strict'

// package
import { Router } from 'express'
const router = new Router()
import Ajv from 'ajv'
const ajv = new Ajv()

var request = require("request")

// using
import HttpStatus from './../helper/http_status.js'
import UsersModel from '../models/usersModel.js'
import { Util, Enum } from '../helper'

/* further work
   - catch error
   */
router.route('/:id').get((req, res, next) => {
    var data = {user_id: req.params.id};
    var schema = {
        'additionalProperties': false,
        'properties': {
            'user_id': {
                'type': 'string'
            }
        },
        'required': [ 'user_id' ]
    };

    var valid = ajv.validate(schema, data)
    if (!valid)
        return HttpStatus.send(res, 'BAD_REQUEST', { message: Util.toAjvResponse(ajv.errors) })

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    }

    UsersModel.getUserById(data.user_id, (user) => {
        if (user == null) {
            send.message = 'Unknown user_id ' + data.user_id;
            return res.json(send);
        } else if (user instanceof Error) {
            send.message = 'Cannot get user ' + data.user_id;
            send.hint = user.sqlMessage;
            return res.json(send);
        }

        send.status = Enum.res_type.SUCCESS;
        send.info = Object.assign({}, user);
        return res.json(send);
    });
});

router.route('/:id/enterprise').get((req, res, next) => {
    var data = {user_id: req.params.id};
    var schema = {
        'additionalProperties': false,
        'properties': {
            'user_id': {
                'type': 'string'
            }
        },
        'required': [ 'user_id' ]
    };

    var valid = ajv.validate(schema, data)
    if (!valid)
        return HttpStatus.send(res, 'BAD_REQUEST', { message: Util.toAjvResponse(ajv.errors) })

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    }

    UsersModel.getEnterpriseByUserId(data.user_id, (user) => {
        if (user == null) {
            send.message = 'Unknown user_id ' + data.user_id;
            return res.json(send);
        } else if (user instanceof Error) {
            send.message = 'Cannot get user ' + data.user_id;
            send.hint = user.sqlMessage;
            return res.json(send);
        }

        send.status = Enum.res_type.SUCCESS;
        send.info = Object.assign({}, user);
        return res.json(send);
    });
});

router.route('/').post((req, res, next) => {
    var data = req.body
    var schema = {
        'additionalProperties': false,
        'properties': {
            'registration_type': {
                'type': 'number'
            },
            'enterprise_name': {
                'type': 'string'
            },
            'title': {
                'type': 'string'
            },
            'name': {
                'type': 'string'
            },
            'lastname': {
                'type': 'string'
            },
            'age': {
                'type': 'number'
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
            'subdistrict_code': {
                'type': 'number'
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
            'contact_info': {
                'type': 'object',
                'properties': {
                    'title': {
                        'type': 'string'
                    },
                    'name': {
                        'type': 'string'
                    },
                    'lastname': {
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
                    'subdistrict_code': {
                        'type': 'number'
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
                },
                'required': [
                    'title', 'name', 'lastname', 'id_no', 'house_no', 'village_no',
                    'subdistrict', 'district', 'province', 'postal_code'
                ]
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
                    },
                }
            },
            'sme_member_no': {
                'type': 'string'
            },
            'is_otop_product': {
                'type': 'boolean'
            },
            'needed_help': {
                'type': 'object',
                'minProperties': 1,
                'maxProperties': 8,
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
                    'needed_help_brand': {
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
            'registration_type', 'enterprise_name', 'title', 'name', 'lastname', 'id_no',
            'house_no', 'village_no', 'subdistrict', 'district', 'province',
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
            send.message = result;

            return res.json(send);
        }

        send.status = Enum.res_type.SUCCESS
        send.info = result;
        return res.json(send)
    });
});

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

export default router
