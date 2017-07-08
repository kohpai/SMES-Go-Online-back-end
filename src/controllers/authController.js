'use strict'

// package
import { Router } from 'express'
import Ajv from 'ajv'
const router = new Router()
const ajv = new Ajv()

var jwt = require("jsonwebtoken")
const secret = 'SME'
const expire_time = 10 // minute
// using
import HttpStatus from './../helper/http_status.js'
import UsersModel from '../models/usersModel.js'
import { Util,Enum } from '../helper'
import Config from '../config.js'



router.route('/*').all((req, res, next) => {
    console.log(req.path)
    const token = req.header('access-token')
    console.log(token)
    if(req.path.startsWith("/products") || req.path.startsWith("/news")){

        var access_token = jwt.sign({ email: '', fullName: '', _id: ''}, secret)
        console.log(access_token)

        jwt.verify(access_token, secret, (err, decode) => {
            if(err){
                console.log(err)
            }
            console.log(decode)
        })

        if(token != 'xxx') {
            return HttpStatus.send(res, 'UNAUTHORIZED', {message: 'The token is invalid.'})
        }
    }

    return next()
})

router.route('/login').post((req, res, next) => {
    // try {
    var data = req.body
    var schema = {
        "additionalProperties": false,
        "properties": {
            "username": {
                "type": "string"
            },
            "pin": {
                "type": "string"
            },
            "machine_token": {
                "type": "string"
            },
            "machine_name": {
                "type": "string"
            }
        },
        "required": [ "username", "pin" ]
    }
    var valid = ajv.validate(schema, data)
    if (!valid)
        return HttpStatus.send(res, 'BAD_REQUEST', { message: Util.toAjvResponse(ajv.errors) })

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    };

    UsersModel.authenUser(data.username, data.pin, (user) => {
        if (user == null) {
            send.message = 'Incorrect username or pin.'
            return res.json(send)
        } else if (user instanceof Error) {
            send.message = 'Incorrect username or pin.'
            send.hint = user.sqlMessage;
            return res.json(send)
        }

        delete user.password
        delete user.otp

        var otp_pass = false
        var machine_token = ''

        // find machine
        UsersModel.findMachine(data.machine_token, (machine) => {
            if (data.machine_token.length == 0 || machine == null || machine instanceof Error) {
                otp_pass = false
                machine_token = jwt.sign({ username: data.username, created: new Date() }, secret)

                // add new machine
                var insert_machine = {
                    user_id: user.user_id,
                    machine_name: data.machine_name,
                    machine_token: machine_token,
                    create_datetime: new Date(),
                    access_datetime: new Date(),
                }
                UsersModel.addMachine(insert_machine, (result) => {
                    if(result instanceof Error){ console.log(result) }
                })

            }else{
                otp_pass = true
                machine_token = data.machine_token

                // update machine
                UsersModel.updateMachine(machine_token, (result) => {
                    if(result instanceof Error){ console.log(result) }
                })
            }

            var expire = new Date()
            expire.setMinutes(expire.getMinutes()+expire_time)
            var access_token = jwt.sign({ username: data.username, otp_pass: otp_pass, expire: expire }, secret)

            send.status = Enum.res_type.SUCCESS
            send.info = { user: user, access_token: access_token, otp_pass: otp_pass, machine_token: machine_token };

            return res.json(send)

        })
    })
})

router.route('/otp').post((req, res, next) => {
    var data = req.body
    var schema = {
        "additionalProperties": false,
        "properties": {
            "access_token": {
                "type": "string"
            },
            "otp": {
                "type": "string"
            }
        },
        "required": [ "access_token" ]
    }
    var valid = ajv.validate(schema, data)
    if (!valid)
        return HttpStatus.send(res, 'BAD_REQUEST', { message: Util.toAjvResponse(ajv.errors) })

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    };

    jwt.verify(data.otp_token, secret, (err, decode) => {
        if (err) {
            send.message = 'Incorrect access_token.'
            return res.json(send)
        }

        // waiting

    })

})

router.route('/send_otp').post((req, res, next) => {
    var data = req.body
    var schema = {
        "additionalProperties": false,
        "properties": {
            "phone_number": {
                "type": "string"
            },
        },
        "required": [ "phone_number" ]
    }
    var valid = ajv.validate(schema, data)
    if (!valid)
        return HttpStatus.send(res, 'BAD_REQUEST', { message: Util.toAjvResponse(ajv.errors) })

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    };

    if(data.phone_number.startsWith('66')){
        data.phone_number = '0'+data.phone_number.slice(2)
    }else if(data.phone_number.startsWith('+66')){
        data.phone_number = '0'+data.phone_number.slice(3)
    }

    // check in db
    UsersModel.findUser(data.phone_number, (user) => {
        if (user == null) {
            send.message = 'Not found user.'
            return res.json(send)
        } else if (user instanceof Error) {
            send.message = 'Not found user.';
            return res.json(send)
        }else if (user.length == 0) {
            send.message = 'Not found user.';
            return res.json(send)
        }

        // gen otp
        var possible = '0123456789' //"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        var otp = ""
        for (var i = 0; i < 6; i++)
            otp += possible.charAt(Math.floor(Math.random() * possible.length));

        // send sms
        // waiting

        // update opt
        UsersModel.updateOtp(data.phone_number, otp, (result) => {
            if (user instanceof Error) {
                send.message = 'Not found user.';
                return res.json(send)
            }

            send.status = Enum.res_type.SUCCESS
            send.message = 'success';
            return res.json(send)
        })

    })
})

router.route('/check_otp').post((req, res, next) => {
    var data = req.body
    var schema = {
        "additionalProperties": false,
        "properties": {
            "phone_number": {
                "type": "string"
            },
            "otp": {
                "type": "string"
            },
        },
        "required": [ "phone_number", "otp" ]
    }
    var valid = ajv.validate(schema, data)
    if (!valid)
        return HttpStatus.send(res, 'BAD_REQUEST', { message: Util.toAjvResponse(ajv.errors) })

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    };

    // check in db
    UsersModel.findUser(data.phone_number, (user) => {
        if (user == null) {
            send.message = 'Incorrect phone_number or otp.'
            return res.json(send)
        } else if (user instanceof Error) {
            send.message = 'Incorrect phone_number or otp.';
            return res.json(send)
        }else if (user.length == 0) {
            send.message = 'Incorrect phone_number or otp.';
            return res.json(send)
        }

        if(user.otp != data.otp){
            send.message = 'Incorrect phone_number or otp.';
            return res.json(send)
        }

        var expire = new Date()
        expire.setMinutes(expire.getMinutes()+expire_time)
        var otp_token = jwt.sign({ username: data.phone_number, otp_pass: true, expire: expire}, secret)

        send.status = Enum.res_type.SUCCESS
        send.message = 'success';
        send.info = {otp_token: otp_token}
        return res.json(send)

    })
})

router.route('/set_pin').post((req, res, next) => {
    var data = req.body
    var schema = {
        "additionalProperties": false,
        "properties": {
            "otp_token": {
                "type": "string"
            },
            "new_pin": {
                "type": "string"
            },
        },
        "required": [ "otp_token", "new_pin" ]
    }
    var valid = ajv.validate(schema, data)
    if (!valid)
        return HttpStatus.send(res, 'BAD_REQUEST', { message: Util.toAjvResponse(ajv.errors) })

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    };

    jwt.verify(data.otp_token, secret, (err, decode) => {
        if(err){
            send.message = 'Incorrect otp_token.'
            return res.json(send)
        }

        var is_expire = new Date() > decode.expire

        if(decode.otp_pass != true | is_expire){
            send.message = 'Incorrect otp_token.'
            return res.json(send)
        }

        // update pin
        UsersModel.updatePin(decode.username, data.new_pin, (result) => {
            if (result instanceof Error) {
                send.message = 'Not found user.';
                return res.json(send)
            }

            send.status = Enum.res_type.SUCCESS
            send.message = 'success';
            return res.json(send)
        })

    })
})

export default router
