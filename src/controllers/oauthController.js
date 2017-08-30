'use strict'

// package
import { Router } from 'express'
import Ajv from 'ajv'
const router = new Router()
const ajv = new Ajv()

var request = require('request');
var querystring = require('querystring');

import HttpStatus from './../helper/http_status.js'
import { Util, Enum } from '../helper'

router.route('/app').post((req, res, next) => {
    
    var data = req.body
    var schema = {
        'additionalProperties': false,
        'properties': {
            'name': {
                'type': 'string'
            },
            'description': {
                'type': 'string'
            },
            'id': {
                'type': 'string'
            },
            'secret': {
                'type': 'string'
            },
            'domain': {
                'type': 'string'
            },
            'url_get_access_token': {
                'type': 'string'
            },
            'url_get_userinfo': {
                'type': 'string'
            },
            'url_fail_userinfo_redirect_to': {
                'type': 'string'
            },
        },
        'required': [
            'name', 'id', 'secret', 'domain', 'url_get_access_token', 'url_get_userinfo', 'url_fail_userinfo_redirect_to'
        ]
    }

    if(!req.user.is_admin){
        return res.json({status: Enum.res_type.FAILURE, info:{}, message: 'Not is admin.'})
    }

    if(req.user.is_admin && !req.user.role.is_manage_oauth){
        return res.json({status: Enum.res_type.FAILURE, info:{}, message: 'Permission denied'})
    }

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    }
    
    var valid = ajv.validate(schema, data)
    if (!valid)
        return res.json({status: Enum.res_type.FAILURE, info:ajv.errors, message: 'bad request.'})

    request({
        headers: {
            secret: 'r5gYGVMfo5i0AGSKjNbw'
        },
        uri: 'http://localhost:8080/backend/app',
        json: {
            name: data.name,
            description: data.description,
            id: data.id,
            secret: data.secret,
            domain: data.domain,
            url_get_access_token: data.url_get_access_token,
            url_get_userinfo: data.url_get_userinfo,
            url_fail_userinfo_redirect_to: data.url_fail_userinfo_redirect_to
        },
        method: 'POST'
    }, function (err, response, body) {
        if(err instanceof Error){
            send.status = Enum.res_type.FAILURE;
            send.message = err;
            return res.json(send);
        }

        res.set('Content-Type', 'application/json');
        return res.send(body)
    })

});

router.route('/app/:id').put((req, res, next) => {

    var id = req.params.id

    var data = req.body
    var schema = {
        'additionalProperties': false,
        'properties': {
            'name': {
                'type': 'string'
            },
            'description': {
                'type': 'string'
            },
            'id': {
                'type': 'string'
            },
            'secret': {
                'type': 'string'
            },
            'domain': {
                'type': 'string'
            },
            'url_get_access_token': {
                'type': 'string'
            },
            'url_get_userinfo': {
                'type': 'string'
            },
            'url_fail_userinfo_redirect_to': {
                'type': 'string'
            },
        },
        'required': [
            'name', 'id', 'secret', 'domain', 'url_get_access_token', 'url_get_userinfo', 'url_fail_userinfo_redirect_to'
        ]
    }

    if(!req.user.is_admin){
        return res.json({status: Enum.res_type.FAILURE, info:{}, message: 'Not is admin.'})
    }

    if(req.user.is_admin && !req.user.role.is_manage_oauth){
        return res.json({status: Enum.res_type.FAILURE, info:{}, message: 'Permission denied'})
    }

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    }

    var valid = ajv.validate(schema, data)
    if (!valid)
        return res.json({status: Enum.res_type.FAILURE, info:ajv.errors, message: 'bad request.'})

    request({
        headers: {
            secret: 'r5gYGVMfo5i0AGSKjNbw'
        },
        uri: 'http://localhost:8080/backend/app/'+id,
        json: {
            name: data.name,
            description: data.description,
            id: data.id,
            secret: data.secret,
            domain: data.domain,
            url_get_access_token: data.url_get_access_token,
            url_get_userinfo: data.url_get_userinfo,
            url_fail_userinfo_redirect_to: data.url_fail_userinfo_redirect_to
        },
        method: 'PUT'
    }, function (err, response, body) {
        if(err instanceof Error){
            send.status = Enum.res_type.FAILURE;
            send.message = err;
            return res.json(send);
        }

        res.set('Content-Type', 'application/json');
        return res.send(body)
    })

});

router.route('/app/:id').delete((req, res, next) => {

    var id = req.params.id

    if(!req.user.is_admin){
        return res.json({status: Enum.res_type.FAILURE, info:{}, message: 'Not is admin.'})
    }

    if(req.user.is_admin && !req.user.role.is_manage_oauth){
        return res.json({status: Enum.res_type.FAILURE, info:{}, message: 'Permission denied'})
    }

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    }

    request({
        headers: {
            secret: 'r5gYGVMfo5i0AGSKjNbw'
        },
        uri: 'http://localhost:8080/backend/app/'+id,
        method: 'DELETE'
    }, function (err, response, body) {
        if(err instanceof Error){
            send.status = Enum.res_type.FAILURE;
            send.message = err;
            return res.json(send);
        }

        res.set('Content-Type', 'application/json');
        return res.send(body)
    })

});

router.route('/app').get((req, res, next) => {

    var page = parseInt(req.query.page, 0)
    var limit = parseInt(req.query.limit, 0)

    if(!req.user.is_admin){
        return res.json({status: Enum.res_type.FAILURE, info:{}, message: 'Not is admin.'})
    }

    if(req.user.is_admin && !req.user.role.is_manage_oauth){
        return res.json({status: Enum.res_type.FAILURE, info:{}, message: 'Permission denied'})
    }

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    }

    request({
        headers: {
            secret: 'r5gYGVMfo5i0AGSKjNbw'
        },
        uri: 'http://localhost:8080/backend/app?page='+page+'&limit='+limit,
        method: 'GET'
    }, function (err, response, body) {
        if(err instanceof Error){
            send.status = Enum.res_type.FAILURE;
            send.message = err;
            return res.json(send);
        }

        res.set('Content-Type', 'application/json');
        return res.send(body)
    })

});

export default router
