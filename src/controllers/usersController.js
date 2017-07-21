'use strict'

// package
import { Router } from 'express'
const router = new Router()
import Ajv from 'ajv'
const ajv = new Ajv()
var jwt = require("jsonwebtoken")

import HttpStatus from './../helper/http_status.js'
import UsersModel from '../models/usersModel.js'
import { Util, Enum } from '../helper'
import Config from '../config.js'

import FileModel from '../models/fileModel.js'

// const fileUpload = require('express-fileupload')
// router.use(fileUpload())
//
// var fs = require('fs')
// var path = require("path")
// var csv = require("fast-csv");

router.route('/users').post((req, res, next) => {
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
            UsersModel.findUserByUsername(decode.username, (user) => {
                if(user instanceof Error){
                    return res.json({status: Enum.res_type.FAILURE, info:{}, message: 'The token is invalid.'})
                }else if(!user.is_admin){
                    return res.json({status: Enum.res_type.FAILURE, info:{}, message: 'The token is invalid.'})
                }
                UsersModel.addUser(data, user.user_id, 'admin', (result, error) => {
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
            UsersModel.addUser(data, null, 'web', (result, error) => {
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

var profile = (req, res, next) => {
    var id = req.params.id
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

    if(id && !req.user.is_admin){
        return res.json({status: Enum.res_type.FAILURE, info:{}, message: 'Not is admin.'})
    }

    var user_id = ''
    var update_user_id = ''
    if(id){ // admin
        user_id = id
        update_user_id = req.user.user_id
    }else{ // web
        user_id = req.user.user_id
        update_user_id = null
    }

    UsersModel.findUser(user_id, (user) => {
        if(user instanceof Error){
            send.status = Enum.res_type.FAILURE;
            send.message = 'user not found.'
            send.info = user
            return res.json(send);
        }

        var send_sms = ''
        if(id){ // admin
            send_sms = user.username
        }else{ // web
            send_sms = req.user.username
        }

        UsersModel.updateUser(user_id, data, req.user.user_id, (result, error) => {
            if (error) {
                send.status = Enum.res_type.FAILURE;
                send.message = result
                send.info = error
                return res.json(send);
            }

            Util.send_sms(send_sms, Config.wording.profile_success, (send_sms_result) => {
                send.status = Enum.res_type.SUCCESS
                send.info = result;
                return res.json(send)
            })
        });
    })
};

router.route('/profile').put(profile);
router.route('/profile/:id').put(profile);

var search = (req, res, next) => {
    var search = ''
    if(req.params.search){
        search = req.params.search
    }
    var page = parseInt(req.query.page, 0)
    var limit = parseInt(req.query.limit, 0)

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    }

    if(!req.user.is_admin){
        return res.json({status: Enum.res_type.FAILURE, info:{}, message: 'Not is admin.'})
    }

    UsersModel.countUsers(search, (count_users) => {
        if (count_users instanceof Error) {
            send.status = Enum.res_type.FAILURE;
            send.message = 'Failed search an users';
            send.info = count_users
            return res.json(send);
        }

        UsersModel.searchUsers(search, page*limit, limit, (result) => {
            if (result instanceof Error) {
                send.status = Enum.res_type.FAILURE;
                send.message = 'Failed search an users';
                return res.json(send);
            }

            send.status = Enum.res_type.SUCCESS
            send.info = result
            send.pageinfo = {page: page, limit: limit, count: count_users.count}
            return res.json(send)
        });
    });
};

router.route('/users/list/:search').get(search)
router.route('/users/list/').get(search)

router.route('/users/:id').get((req, res, next) => {
    var id = req.params.id

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    }

    if(!req.user.is_admin){
        return res.json({status: Enum.res_type.FAILURE, info:{}, message: 'Not is admin.'})
    }

    UsersModel.detailUser(id, (user) => {
        if (user instanceof Error) {
            send.status = Enum.res_type.FAILURE;
            send.message = user;
            return res.json(send);
        }

        if(user.is_admin){
            send.status = Enum.res_type.SUCCESS
            send.info = user;
            return res.json(send)
        }

        UsersModel.getEnterpriseByUserId(user.user_id, (ent) => {
            if(ent instanceof Error){
                send.status = Enum.res_type.FAILURE
                send.message = ent
                return res.json(send)
            }

            var date = new Date(ent.birthyear);
            var now = new Date();

            user.ent = ent
            user.ent.age = now.getFullYear() - date.getFullYear()

            send.status = Enum.res_type.SUCCESS
            send.info = user;
            return res.json(send)
        })

    });
});

// router.route('/users/import').post((req, res, next) => {
//     var send = {
//         status: Enum.res_type.FAILURE,
//         info: {}
//     }
//
//     if(!req.user.is_admin){
//         return res.json({status: Enum.res_type.FAILURE, info:{}, message: 'Not is admin.'})
//     }
//
//     if(!req.files || !req.files.file){
//         send.message = 'File not found.'
//         return res.json(send)
//     }
//
//     var i = 0
//     var success = []
//     var fail = []
//
//     FileModel.saveFileLocal(req.files.file, (result) => {
//         if (result == null) {
//             send.status = Enum.res_type.FAILURE
//             send.message = 'file not found'
//             return res.json(send)
//         }
//
//         var schema = {
//             'additionalProperties': false,
//             'properties': {
//                 'registration_type': {
//                     'type': 'number'
//                 },
//                 'enterprise_name': {
//                     'type': 'string'
//                 },
//                 'title': {
//                     'type': 'string'
//                 },
//                 'name': {
//                     'type': 'string'
//                 },
//                 'lastname': {
//                     'type': 'string'
//                 },
//                 'age': {
//                     'type': 'number'
//                 },
//                 'id_no': {
//                     'type': 'string'
//                 },
//                 'house_no': {
//                     'type': 'string'
//                 },
//                 'village_no': {
//                     'type': 'string'
//                 },
//                 'alley': {
//                     'type': 'string'
//                 },
//                 'village_title': {
//                     'type': 'string'
//                 },
//                 'road': {
//                     'type': 'string'
//                 },
//                 'subdistrict_code': {
//                     'type': 'number'
//                 },
//                 'subdistrict': {
//                     'type': 'string'
//                 },
//                 'district': {
//                     'type': 'string'
//                 },
//                 'province': {
//                     'type': 'string'
//                 },
//                 'postal_code': {
//                     'type': 'string'
//                 },
//                 'legal_title': {
//                     'type': 'string'
//                 },
//                 'legal_name': {
//                     'type': 'string'
//                 },
//                 'legal_id': {
//                     'type': 'string'
//                 },
//                 /*'contact_info': {
//                  'type': 'object',
//                  'properties': {
//                  'title': {
//                  'type': 'string'
//                  },
//                  'name': {
//                  'type': 'string'
//                  },
//                  'lastname': {
//                  'type': 'string'
//                  },
//                  'id_no': {
//                  'type': 'string'
//                  },
//                  'house_no': {
//                  'type': 'string'
//                  },
//                  'village_no': {
//                  'type': 'string'
//                  },
//                  'alley': {
//                  'type': 'string'
//                  },
//                  'village_title': {
//                  'type': 'string'
//                  },
//                  'road': {
//                  'type': 'string'
//                  },
//                  'subdistrict_code': {
//                  'type': 'number'
//                  },
//                  'subdistrict': {
//                  'type': 'string'
//                  },
//                  'district': {
//                  'type': 'string'
//                  },
//                  'province': {
//                  'type': 'string'
//                  },
//                  'postal_code': {
//                  'type': 'string'
//                  },
//                  },
//                  'required': [
//                  'title', 'name', 'lastname', 'id_no', 'house_no', 'village_no',
//                  'subdistrict', 'district', 'province', 'postal_code'
//                  ]
//                  },*/
//                 'phone_no': {
//                     'type': 'string'
//                 },
//                 'email': {
//                     'type': 'string'
//                 },
//                 'line_id': {
//                     'type': 'string'
//                 },
//                 'facebook': {
//                     'type': 'string'
//                 },
//                 'enterprise_type': {
//                     'type': 'object',
//                     'minProperties': 1,
//                     'maxProperties': 5,
//                     'properties': {
//                         'agricultural_product': {
//                             'type': 'string'
//                         },
//                         'industrial_product': {
//                             'type': 'string'
//                         },
//                         'selling': {
//                             'type': 'string'
//                         },
//                         'service': {
//                             'type': 'string'
//                         },
//                         'other': {
//                             'type': 'string'
//                         },
//                     }
//                 },
//                 'sme_member_no': {
//                     'type': 'string'
//                 },
//                 'is_otop_product': {
//                     'type': 'boolean'
//                 },
//                 'needed_help': {
//                     'type': 'object',
//                     'minProperties': 1,
//                     'maxProperties': 8,
//                     'properties': {
//                         'needed_help_ecommerce': {
//                             'type': 'boolean'
//                         },
//                         'needed_help_investor': {
//                             'type': 'boolean'
//                         },
//                         'needed_help_supplier': {
//                             'type': 'boolean'
//                         },
//                         'needed_help_payment': {
//                             'type': 'boolean'
//                         },
//                         'needed_help_logistics': {
//                             'type': 'boolean'
//                         },
//                         'needed_help_brand': {
//                             'type': 'boolean'
//                         },
//                         'needed_help_online_marketing': {
//                             'type': 'boolean'
//                         },
//                         'needed_help_tax': {
//                             'type': 'boolean'
//                         }
//                     }
//                 },
//                 'on_ecommerce': {
//                     'type': 'boolean'
//                 }
//             },
//             'required': [
//                 'registration_type', 'enterprise_name', 'title', 'name', 'lastname', 'id_no',
//                 'house_no', 'village_no', 'subdistrict', 'district', 'province',
//                 'postal_code', 'phone_no', 'enterprise_type', 'needed_help'
//             ]
//         }
//
//         csv.fromPath(result)
//             .on("data", function(row){
//                 console.log(row);
//                 console.log('--------------------')
//
//                 if(i == 0 || i == 1){
//
//                 }else{
//
//                     var registration_type = 1
//                     if(data[1] == 'บุคคลธรรมดา'){
//                         registration_type = 1
//                     }else if(data[1] == 'กลุ่มเครือข่าย'){
//                         registration_type = 2
//                     }else if(data[1] == 'นิติบุคคล'){
//                         registration_type = 3
//                     }else{
//                         return row
//                     }
//
//                     var title = 'นาย'
//                     if(data[4] == 'นาย' || data[4] == 'นาง' || data[4] == 'นางสาว'){
//                         title = data[4]
//                     }else{
//                         return row
//                     }
//
//                     var data = {
//                         registration_type: registration_type,
//                         enterprise_name: data[3],
//                         title: title,
//                     }
//
//                     var valid = ajv.validate(schema, data)
//                     // if (!valid)
//                     //     console.log({status: Enum.res_type.FAILURE, info:ajv.errors, message: 'bad request.'})
//
//
//                 }
//
//                 i++
//             })
//             .on("end", function(){
//                 return res.json(send)
//             });
//
//     });
// });

export default router
