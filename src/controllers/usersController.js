'use strict'

// package
import { Router } from 'express'
const router = new Router()
import Ajv from 'ajv'
const ajv = new Ajv()
var jwt = require("jsonwebtoken")

// using
import HttpStatus from './../helper/http_status.js'
import UsersModel from '../models/usersModel.js'
import { Util, Enum } from '../helper'
import Config from '../config.js'

router.route('/users/:id').get((req, res, next) => {
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
        return res.json({status: Enum.res_type.FAILURE, info:ajv.errors, message: 'bad request.'})

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

router.route('/users/:id/enterprise').get((req, res, next) => {
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
        return res.json({status: Enum.res_type.FAILURE, info:ajv.errors, message: 'bad request.'})

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

router.route('/users/').post((req, res, next) => {
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
            'legal_title': {
                'type': 'string'
            },
            'legal_name': {
                'type': 'string'
            },
            'legal_id': {
                'type': 'string'
            },
            /*'contact_info': {
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
            },*/
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
        return res.json({status: Enum.res_type.FAILURE, info:ajv.errors, message: 'bad request.'})

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    }

    var phone_no = data.phone_no

    var access_token = req.header('access_token')
    jwt.verify(access_token, Config.pwd.jwt_secret, (err, decode) => {
        if(err && access_token){
            return res.json({status: Enum.res_type.FAILURE, info:{}, message: 'The token is invalid.'})
        }

        if(access_token){
            UsersModel.findUser(decode.username, (user) => {
                if(user instanceof Error){
                    return res.json({status: Enum.res_type.FAILURE, info:{}, message: 'The token is invalid.'})
                }else if(!user.is_admin){
                    return res.json({status: Enum.res_type.FAILURE, info:{}, message: 'The token is invalid.'})
                }
                UsersModel.addUser(data, user.user_id, (result, error) => {
                    if (error) {
                        send.status = Enum.res_type.FAILURE;
                        send.message = result
                        send.info = error
                        return res.json(send);
                    }

                    Util.send_sms(phone_no, Config.wording.register_success, (send_sms_result) => {
                        send.status = Enum.res_type.SUCCESS
                        send.info = result;
                        return res.json(send)
                    })
                });
            })

        }else{
            UsersModel.addUser(data, null, (result, error) => {
                if (error) {
                    send.status = Enum.res_type.FAILURE;
                    send.message = result
                    send.info = error
                    return res.json(send);
                }

                Util.send_sms(phone_no, Config.wording.register_success, (send_sms_result) => {
                    send.status = Enum.res_type.SUCCESS
                    send.info = result;
                    return res.json(send)
                })
            });
        }
    })
});

router.route('/profile/').put((req, res, next) => {
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
            'legal_title': {
                'type': 'string'
            },
            'legal_name': {
                'type': 'string'
            },
            'legal_id': {
                'type': 'string'
            },
            /*'phone_no': {
                'type': 'string'
            },*/
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
            'postal_code', /*'phone_no',*/ 'enterprise_type', 'needed_help'
        ]
    }
    var valid = ajv.validate(schema, data)
    if (!valid)
        return res.json({status: Enum.res_type.FAILURE, info:ajv.errors, message: 'bad request.'})

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    }

    UsersModel.findUser(req.user.username, (user) => {
        if(user instanceof Error){
            send.status = Enum.res_type.FAILURE;
            send.message = 'user not found.'
            send.info = user
            return res.json(send);
        }

        UsersModel.updateUser(req.user.username, data, (result, error) => {
            if (error) {
                send.status = Enum.res_type.FAILURE;
                send.message = result
                send.info = error
                return res.json(send);
            }

            Util.send_sms(user.username, Config.wording.profile_success, (send_sms_result) => {
                send.status = Enum.res_type.SUCCESS
                send.info = result;
                return res.json(send)
            })
        });
    })
});

export default router
