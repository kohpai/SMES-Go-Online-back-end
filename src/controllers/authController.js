'use strict'

// package
import { Router } from 'express'
import Ajv from 'ajv'
const router = new Router()
const ajv = new Ajv()

// using
import HttpStatus from './../helper/http_status.js'
import UsersModel from '../models/usersModel.js'
import { Util,Enum } from '../helper'
import Config from '../config.js'



router.route('/*').all((req, res, next) => {
    // console.log(req.path)
    // const token = req.header('access-token')
    // console.log(token)
    // if(token != 'xxx') return HttpStatus.send(res, 'UNAUTHORIZED', { message: 'The token is invalid.' })
    return next()
})

router.route('/auth/login').post((req, res, next) => {
    // try {
    var data = req.body
    var schema = {
        "additionalProperties": false,
        "properties": {
            "username": {
                "type": "string"
            },
            "password": {
                "type": "string"
            }
        },
        "required": [ "username", "password" ]
    }
    var valid = ajv.validate(schema, data)
    if (!valid)
        return HttpStatus.send(res, 'BAD_REQUEST', { message: Util.toAjvResponse(ajv.errors) })

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    };

    UsersModel.authenUser(data.username, data.password, (user) => {
        if (user == null) {
            send.message = 'Incorrect username or password.'
            return res.json(send)
        } else if (user instanceof Error) {
            send.message = 'User query failed';
            send.hint = user.sqlMessage;
            return res.json(send)
        }

        send.status = Enum.res_type.SUCCESS
        send.info = user;

        return res.json(send)
    })
    // }
    // catch(error){
    //   return HttpStatus.send(res, 'INTERNAL_SERVER_ERROR')
    // }
})

export default router
