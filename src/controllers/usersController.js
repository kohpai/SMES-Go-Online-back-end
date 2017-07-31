'use strict'

// package
import { Router } from 'express'
const router = new Router()
import Ajv from 'ajv'
const ajv = new Ajv()
var jwt = require("jsonwebtoken")

import HttpStatus from './../helper/http_status.js'
import UsersModel from '../models/usersModel.js'
import ImportModel from '../models/importModel.js'
import { Util, Enum } from '../helper'
import Config from '../config.js'
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

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    }

    if(!req.user.is_admin){
        return res.json({status: Enum.res_type.FAILURE, info:{}, message: 'Not is admin.'})
    }

    if (req.user.is_admin && !req.user.role.is_manage_enterprise && !req.user.role.is_add_enterprise) {
        return res.json({status: Enum.res_type.FAILURE, info:{}, message: 'Permission denied'})
    }

    var create_by
    if(req.user.role.is_add_enterprise){
        create_by = req.user.user_id
    }else if(req.user.role.is_manage_enterprise){
        create_by = '%'
    }else{
        create_by = '%'
    }

    UsersModel.countUsers(search, create_by, (count_users) => {
        if (count_users instanceof Error) {
            send.status = Enum.res_type.FAILURE;
            send.message = 'Failed search an users';
            send.info = count_users
            return res.json(send);
        }

        UsersModel.searchUsers(search, create_by, page*limit, limit, (result) => {
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

router.route('/users/import').post((req, res, next) => {
    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    }

    if(!req.user.is_admin){
        return res.json({status: Enum.res_type.FAILURE, info:{}, message: 'Not is admin.'})
    }

    if (req.user.is_admin && !req.user.role.is_add_enterprise && !req.user.role.is_manage_enterprise) {
        return res.json({status: Enum.res_type.FAILURE, info:{}, message: 'Permission denied'})
    }

    if(!req.files || !req.files.file){
        send.message = 'File not found.'
        return res.json(send)
    }

    FileModel.saveFileLocal(req.files.file, (result) => {
        if (result == null) {
            send.status = Enum.res_type.FAILURE
            send.message = 'file not found'
            return res.json(send)
        }

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

        var i = 0
        var ts = new Date().getTime()

        csv.fromPath(result)
            .on("data", function(data){

                var position = i
                var status_message = ''
                var status_info = {}

                if(position == 0 || position == 1){

                }else{
                    var isError = false

                    var registration_type = 1
                    if(!isError){

                        if(data[1] == 'บุคคลธรรมดา'){
                            registration_type = 1
                        }else if(data[1] == 'กลุ่มเครือข่าย'){
                            registration_type = 2
                        }else if(data[1] == 'นิติบุคคล'){
                            registration_type = 3
                        }else{
                            isError = true
                            status_message = 'registration_type unknown'
                        }
                    }

                    var enterprise_name = ''
                    if(!isError){
                        if(data[3].length){
                            enterprise_name = data[3]
                        }else{
                            isError = true
                            status_message = 'enterprise_name not empty'
                        }
                    }

                    var title = ''
                    if(!isError){
                        if(data[4] == 'นาย' || data[4] == 'นาง' || data[4] == 'นางสาว'){
                            title = data[4]
                        }else{
                            isError = true
                            status_message = 'title unknown'
                        }
                    }

                    var name = ''
                    if(!isError){
                        if(data[5].length){
                            name = data[5]
                        }else{
                            isError = true
                            status_message = 'name not empty'
                        }
                    }

                    var lastName = ''
                    if(!isError){
                        if(data[6].length){
                            lastName = data[6]
                        }else{
                            isError = true
                            status_message = 'lastName not empty'
                        }
                    }

                    var age = ''
                    if(!isError){
                        var parseAge = parseInt(data[7])
                        if(!isNaN(parseAge)){
                            age = parseAge
                        }else{
                            isError = true
                            status_message = 'age not empty or not number'
                        }
                    }

                    var house_no = ''
                    if(!isError){
                        if(data[8].length){
                            house_no = data[8]
                        }else{
                            isError = true
                            status_message = 'house_no not empty'
                        }
                    }

                    var province = ''
                    if(!isError){
                        if(data[13].length){
                            province = data[13]
                        }else{
                            isError = true
                            status_message = 'province not empty'
                        }
                    }

                    var district = ''
                    if(!isError){
                        if(data[14].length){
                            district = data[14]
                        }else{
                            isError = true
                            status_message = 'district not empty'
                        }
                    }

                    var subdistrict = ''
                    if(!isError){
                        if(data[15].length){
                            subdistrict = data[15]
                        }else{
                            isError = true
                            status_message = 'subdistrict not empty'
                        }
                    }

                    var postal_code = ''
                    if(!isError) {
                        if (data[16].length) {
                            postal_code = data[16]
                        } else {
                            isError = true
                            status_message = 'postal_code not empty'
                        }
                    }

                    var phone_no = ''
                    if(!isError) {
                        if (data[17].length == 10) {
                            phone_no = data[17]
                        } else {
                            isError = true
                            status_message = 'phone_no not empty or not 10 digit'
                        }
                    }

                    var id_no = ''
                    if(!isError) {
                        if (data[18].length == 13) {
                            id_no = data[18]
                        } else {
                            isError = true
                            status_message = 'id_no not empty or not 13 digit'
                        }
                    }

                    var legal_title = ''
                    if(!isError && registration_type == 3) {
                        if (data[24].length) {
                            legal_title = data[24]
                        } else {
                            isError = true
                            status_message = 'legal_title not empty'
                        }
                    }

                    var legal_name = ''
                    if(!isError && registration_type == 3) {
                        if (data[25].length) {
                            legal_name = data[25]
                        } else {
                            isError = true
                            status_message = 'legal_name not empty'
                        }
                    }

                    var legal_id = ''
                    if(!isError && registration_type == 3) {
                        if (data[26].length) {
                            legal_id = data[26]
                        } else {
                            isError = true
                            status_message = 'legal_id not empty'
                        }
                    }

                    var on_ecommerce = false
                    if(!isError) {
                        if (data[22].length) {
                            on_ecommerce = true
                        } else {
                            on_ecommerce = false
                        }
                    }

                    var is_otop_product = false
                    if(!isError) {
                        if (data[23] == 'Y' || data[23] == 'y') {
                            is_otop_product = true
                        } else {
                            is_otop_product = false
                        }
                    }

                    var needed_help_ecommerce = false
                    if(!isError) {
                        if (data[32] == 'Y' || data[32] == 'y') {
                            needed_help_ecommerce = true
                        } else {
                            needed_help_ecommerce = false
                        }
                    }

                    var needed_help_investor = false
                    if(!isError) {
                        if (data[33] == 'Y' || data[33] == 'y') {
                            needed_help_investor = true
                        } else {
                            needed_help_investor = false
                        }
                    }

                    var needed_help_supplier = false
                    if(!isError) {
                        if (data[34] == 'Y' || data[34] == 'y') {
                            needed_help_supplier = true
                        } else {
                            needed_help_supplier = false
                        }
                    }

                    var needed_help_payment = false
                    if(!isError) {
                        if (data[35] == 'Y' || data[35] == 'y') {
                            needed_help_payment = true
                        } else {
                            needed_help_payment = false
                        }
                    }

                    var needed_help_online_marketing = false
                    if(!isError) {
                        if (data[36] == 'Y' || data[36] == 'y') {
                            needed_help_online_marketing = true
                        } else {
                            needed_help_online_marketing = false
                        }
                    }

                    var needed_help_tax = false
                    if(!isError) {
                        if (data[37] == 'Y' || data[37] == 'y') {
                            needed_help_tax = true
                        } else {
                            needed_help_tax = false
                        }
                    }

                    var needed_help_brand = false
                    if(!isError) {
                        if (data[38] == 'Y' || data[38] == 'y') {
                            needed_help_brand = true
                        } else {
                            needed_help_brand = false
                        }
                    }

                    var needed_help_logistics = false
                    if(!isError) {
                        if (data[39] == 'Y' || data[39] == 'y') {
                            needed_help_logistics = true
                        } else {
                            needed_help_logistics = false
                        }
                    }

                    if(!isError){

                        var d = {
                            registration_type: registration_type,
                            enterprise_name: enterprise_name,
                            id_no: id_no,
                            title: title,
                            name: name,
                            lastname: lastName,
                            age: age,
                            house_no: house_no,
                            village_no: data[9],
                            alley: data[10],
                            village_title: data[11],
                            road: data[12],
                            province: province,
                            district: district,
                            subdistrict: subdistrict,
                            postal_code: postal_code,
                            phone_no: phone_no,
                            sme_member_no: data[2],
                            email: data[19],
                            line_id: data[20],
                            facebook: data[21],
                            legal_title: legal_title,
                            legal_name: legal_name,
                            legal_id: legal_id,
                            on_ecommerce: on_ecommerce,
                            is_otop_product: is_otop_product,
                            enterprise_type: {
                                agricultural_product: data[27],
                                industrial_product: data[28],
                                selling: data[29],
                                service: data[30],
                                other: data[31],
                            },
                            needed_help: {
                                needed_help_ecommerce: needed_help_ecommerce,
                                needed_help_investor: needed_help_investor,
                                needed_help_supplier: needed_help_supplier,
                                needed_help_payment: needed_help_payment,
                                needed_help_online_marketing: needed_help_online_marketing,
                                needed_help_tax: needed_help_tax,
                                needed_help_brand: needed_help_brand,
                                needed_help_logistics: needed_help_logistics,
                            }
                        }

                        var valid = ajv.validate(schema, d)
                        if (!valid){
                            isError = true
                            status_message = title+name+' '+lastName+', '+phone_no+' : '+'bad request'

                            // update import detail
                            ImportModel.addImportDetail(ts, position, status_message, ajv.errors, (result) => {})

                        }else{
                            UsersModel.addUser(d, req.user_id, 'import', (result, error) => {
                                if (error) {
                                    isError = true
                                    status_message = title+name+' '+lastName+', '+phone_no+' : '+result

                                    // update import detail
                                    ImportModel.addImportDetail(ts, position, status_message, error, (result) => {})

                                }else{
                                    Util.send_sms(phone_no, Config.wording.register_success, (send_sms_result) => {
                                        if(send_sms_result instanceof Error){
                                            isError = true
                                            status_message = title+name+' '+lastName+', '+phone_no+' : '+'can\'t send sms'

                                            // update import detail
                                            ImportModel.addImportDetail(ts, position, status_message, send_sms_result, null, (result) => {})

                                        }else{
                                            isError = false
                                            status_message = title+name+' '+lastName+', '+phone_no+' : '+'success'

                                            // update import detail
                                            ImportModel.addImportDetail(ts, position, status_message, null, (result) => {})
                                        }
                                    })
                                }
                            });

                        }
                    }else{

                        status_message = title+name+' '+lastName+', '+phone_no+' : '+status_message

                        // update import detail
                        ImportModel.addImportDetail(ts, position, status_message, null, (result) => {})
                    }
                }

                i++
            })
            .on("end", function(){
                ImportModel.addImport(ts, 1, req.files.file.name, req.user.user_id, (result) => {
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
    });
});

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
            },
            'recaptcha': {
                'type': 'string'
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

    Util.check_recaptcha(data.recaptcha, (recaptcha) => {
        if(recaptcha instanceof Error){
            return res.json({status: Enum.res_type.FAILURE, info:recaptcha, message: 'fail recaptcha.'})
        }

        if(recaptcha.success != true){
            return res.json({status: Enum.res_type.FAILURE, info:recaptcha, message: 'fail recaptcha.'})
        }

        delete data.recaptcha

        var phone_no = data.phone_no

        var access_token = req.header('access_token')
        jwt.verify(access_token, Config.pwd.jwt_secret, (err, decode) => {
            if(err && access_token){
                return res.json({status: Enum.res_type.FAILURE, info:{}, message: 'The token is invalid.'})
            }

            if(access_token){
                UsersModel.findUser(decode.user_id, (user) => {
                    if(user instanceof Error){
                        return res.json({status: Enum.res_type.FAILURE, info:{}, message: 'The token is invalid.'})
                    }else if(!user.is_admin){
                        return res.json({status: Enum.res_type.FAILURE, info:{}, message: 'The token is invalid.'})
                    }

                    if(!user.is_admin){
                        return res.json({status: Enum.res_type.FAILURE, info:{}, message: 'Not is admin.'})
                    }

                    UsersModel.detailRole(user.role_id, (role) => {
                        if (role instanceof Error) {
                            return res.json({status: Enum.res_type.FAILURE, info:{}, message: 'not found role'})
                        }

                        if(user.is_admin && !role.is_add_enterprise && !role.is_manage_enterprise){
                            return res.json({status: Enum.res_type.FAILURE, info:{}, message: 'Permission denied'})
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

    })
});

router.route('/users/:id').get((req, res, next) => {
    var id = req.params.id

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    }

    if(!req.user.is_admin){
        return res.json({status: Enum.res_type.FAILURE, info:{}, message: 'Not is admin.'})
    }

    if (req.user.is_admin && !req.user.role.is_manage_enterprise) {
        return res.json({status: Enum.res_type.FAILURE, info:{}, message: 'Permission denied'})
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

    if(id && !req.user.is_admin && !req.user.role.is_manage_enterprise){
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


router.route('/import').get((req, res, next) => {
    var import_type = req.query.import_type
    var page = parseInt(req.query.page, 0)
    var limit = parseInt(req.query.limit, 0)

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    }

    if(!req.user.is_admin){
        return res.json({status: Enum.res_type.FAILURE, info:{}, message: 'Not is admin.'})
    }

    if (req.user.is_admin && !req.user.role.is_history_import) {
        return res.json({status: Enum.res_type.FAILURE, info:{}, message: 'Permission denied'})
    }

    ImportModel.getImportCount(import_type, (count_import) => {
        if (count_import instanceof Error) {
            send.status = Enum.res_type.FAILURE;
            send.message = 'not found import'
            return res.json(send);
        }

        ImportModel.getImportList(import_type, page*limit, limit, (result) => {
            if (result instanceof Error) {
                console.log(result)
                send.status = Enum.res_type.FAILURE;
                send.message = 'not found import'
                return res.json(send);
            }

            send.status = Enum.res_type.SUCCESS
            send.info = result
            send.pageinfo = {page: page, limit: limit, count: count_import.count}
            return res.json(send)
        });
    })
});

router.route('/import/:id').get((req, res, next) => {
    var id = req.params.id
    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    }

    if(!req.user.is_admin){
        return res.json({status: Enum.res_type.FAILURE, info:{}, message: 'Not is admin.'})
    }

    if (req.user.is_admin && !req.user.role.is_history_import) {
        return res.json({status: Enum.res_type.FAILURE, info:{}, message: 'Permission denied'})
    }

    ImportModel.getImport(id, (result) => {
        if (result instanceof Error) {
            send.status = Enum.res_type.FAILURE;
            send.message = 'not found import'
            return res.json(send);
        }

        send.status = Enum.res_type.SUCCESS
        send.info = result
        return res.json(send)
    });
});


// admin
router.route('/admin/role').get((req, res, next) => {
    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    }

    if(!req.user.is_admin){
        return res.json({status: Enum.res_type.FAILURE, info:{}, message: 'Not is admin.'})
    }

    if (req.user.is_admin && !req.user.role.is_manage_users) {
        return res.json({status: Enum.res_type.FAILURE, info:{}, message: 'Permission denied'})
    }

    UsersModel.getRole((roles) => {
        if (roles instanceof Error) {
            send.status = Enum.res_type.FAILURE;
            send.message = 'Failed get role';
            send.info = roles
            return res.json(send);
        }

        send.status = Enum.res_type.SUCCESS
        send.info = roles
        return res.json(send)
    });
})

router.route('/admin/list').get((req, res, next) => {
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

    if (req.user.is_admin && !req.user.role.is_manage_users) {
        return res.json({status: Enum.res_type.FAILURE, info:{}, message: 'Permission denied'})
    }

    UsersModel.countAdmin(search, (count_users) => {
        if (count_users instanceof Error) {
            send.status = Enum.res_type.FAILURE;
            send.message = 'Failed search an users';
            send.info = count_users
            return res.json(send);
        }

        UsersModel.searchAdmin(search, page*limit, limit, (result) => {
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
})

router.route('/admin/:id').get((req, res, next) => {
    var id = req.params.id

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    }

    if(!req.user.is_admin){
        return res.json({status: Enum.res_type.FAILURE, info:{}, message: 'Not is admin.'})
    }

    if (req.user.is_admin && !req.user.role.is_manage_users) {
        return res.json({status: Enum.res_type.FAILURE, info:{}, message: 'Permission denied'})
    }

    UsersModel.detailUser(id, (user) => {
        if (user instanceof Error) {
            send.status = Enum.res_type.FAILURE;
            send.message = user;
            return res.json(send);
        }

        UsersModel.detailRole(user.role_id, (role) => {
            if (role instanceof Error) {
                send.status = Enum.res_type.FAILURE;
                send.message = user;
                return res.json(send);
            }

            user.role = role

            send.status = Enum.res_type.SUCCESS
            send.info = user;
            return res.json(send)
        })
    });
});

router.route('/admin').post((req, res, next) => {
    var data = req.body
    var schema = {
        'additionalProperties': false,
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
            'role_id': {
                'type': 'number'
            },
            'phone_no': {
             'type': 'string'
             }
        },
        'required': [
            'title', 'name', 'lastname', 'role_id', 'phone_no'
        ]
    }
    var valid = ajv.validate(schema, data)
    if (!valid)
        return res.json({status: Enum.res_type.FAILURE, info:ajv.errors, message: 'bad request.'})

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    }

    if(!req.user.is_admin){
        return res.json({status: Enum.res_type.FAILURE, info:{}, message: 'Not is admin.'})
    }

    if (req.user.is_admin && !req.user.role.is_manage_users) {
        return res.json({status: Enum.res_type.FAILURE, info:{}, message: 'Permission denied'})
    }

    UsersModel.addAdmin(data, (result, error) => {
        if (error) {
            send.status = Enum.res_type.FAILURE;
            send.message = result
            send.info = error
            return res.json(send);
        }

        Util.send_sms(data.phone_no, Config.wording.register_success, (send_sms_result) => {
            send.status = Enum.res_type.SUCCESS
            send.info = result;
            return res.json(send)
        })
    })

})

router.route('/admin/:id').put((req, res, next) => {
    var id = req.params.id
    var data = req.body
    var schema = {
        'additionalProperties': false,
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
            'role_id': {
                'type': 'number'
            }
        },
        'required': [
            'title', 'name', 'lastname', 'role_id'
        ]
    }
    var valid = ajv.validate(schema, data)
    if (!valid)
        return res.json({status: Enum.res_type.FAILURE, info:ajv.errors, message: 'bad request.'})

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    }

    if(!req.user.is_admin){
        return res.json({status: Enum.res_type.FAILURE, info:{}, message: 'Not is admin.'})
    }

    if (req.user.is_admin && !req.user.role.is_manage_users) {
        return res.json({status: Enum.res_type.FAILURE, info:{}, message: 'Permission denied'})
    }

    UsersModel.findUser(id, (user) => {
        if (user instanceof Error) {
            send.status = Enum.res_type.FAILURE;
            send.message = 'not found admin'
            send.info = user
            return res.json(send);
        }

        UsersModel.updateAdmin(id, data, (result, error) => {
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
        })
    })

})

export default router
