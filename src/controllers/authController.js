'use strict'

// package
import { Router } from 'express'
import Ajv from 'ajv'
const router = new Router()
const ajv = new Ajv()

var request = require("request")
var windows874 = require('windows-874');

var jwt = require("jsonwebtoken")
const secret = 'SME'
const expire_time = 10 // minute
// using
import HttpStatus from './../helper/http_status.js'
import UsersModel from '../models/usersModel.js'
import { Util,Enum } from '../helper'
import Config from '../config.js'

router.route('/*').all((req, res, next) => {
    const access_token = req.header('access_token')
    const otp_token = req.header('otp_token')
    if(req.path.startsWith('/products') || req.path.startsWith('/news') || req.path.startsWith('/consult') || req.path.startsWith('/profile')){

        jwt.verify(access_token, secret, (err, decode) => {
            if(err){
                return HttpStatus.send(res, 'UNAUTHORIZED', {message: 'The token is invalid. 1'})
            }
            if(!decode.otp_pass){
                return HttpStatus.send(res, 'UNAUTHORIZED', {message: 'The token is invalid. 2'})
            }

            UsersModel.findUser(decode.username, (result) => {
                if(result instanceof Error){
                    return HttpStatus.send(res, 'UNAUTHORIZED', {message: 'The token is invalid. 3'})
                }

                UsersModel.getEnterpriseByUserId(result.user_id, (ent) => {
                    if(ent instanceof Error){
                        HttpStatus.send(res, 'UNAUTHORIZED', {message: 'The token is invalid. 4'})
                    }

                    req.user = result
                    req.user.ent = ent
                    return next()

                })
            })
        })

    }else if(req.path.startsWith('/otp') || req.path.startsWith('/reset_otp')){

        jwt.verify(access_token, secret, (err, decode) => {
            if(err){
                return HttpStatus.send(res, 'UNAUTHORIZED', {message: 'The token is invalid.'})
            }
            return next()
        })

    }else if(req.path.startsWith("/set_pin")){
        jwt.verify(otp_token, secret, (err, decode) => {
            if(err){
                return HttpStatus.send(res, 'UNAUTHORIZED', {message: 'The token is invalid.'})
            }
            var is_expire = new Date() > decode.expire
            if(is_expire){
                return HttpStatus.send(res, 'UNAUTHORIZED', {message: 'The token is invalid.'})
            }
            return next()
        })

    }else{
        return next()
    }
})

router.route('/status').get((req, res, next) => {
    const access_token = req.header('access_token')
    jwt.verify(access_token, secret, (err, decode) => {
        if(err){
            return HttpStatus.send(res, 'UNAUTHORIZED', {message: 'The token is invalid. 1'})
        }

        var send = {
            status: Enum.res_type.FAILURE,
            info: {}
        };

        UsersModel.findUser(decode.username, (result) => {
            if(result instanceof Error){
                return HttpStatus.send(res, 'UNAUTHORIZED', {message: 'The token is invalid. 3'})
            }

            delete result.password
            delete result.otp

            UsersModel.getEnterpriseByUserId(result.user_id, (ent) => {
                if(ent instanceof Error){
                    send.status = Enum.res_type.FAILURE
                    send.message = ent
                    return res.json(send)
                }

                send.status = Enum.res_type.SUCCESS
                result.ent = ent
                send.info = { user: result, access_token: access_token, ent_id: decode.ent_id, otp_pass: decode.otp_pass };

                return res.json(send)
            })

        })
    })
})

router.route('/login').post((req, res, next) => {
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
        if (user == null || user.length == 0) {
            send.message = 'Incorrect username or pin.'
            return res.json(send)
        } else if (user instanceof Error) {
            send.message = 'Incorrect username or pin.'
            return res.json(send)
        }

        delete user.password
        delete user.otp

        var otp_pass = false
        var machine_token = ''

        // find machine
        UsersModel.findMachine(data.machine_token, (machine) => {
            if (machine == null || machine instanceof Error || machine.length == 0) {
                otp_pass = false
                machine_token = jwt.sign({ username: data.username, created: new Date() }, secret)

                // add new machine
                var insert_machine = {
                    user_id: user.user_id,
                    machine_name: data.machine_name,
                    machine_token: machine_token,
                    create_datetime: new Date(),
                    access_datetime: new Date(),
                    otp_pass: otp_pass,
                }
                UsersModel.addMachine(insert_machine, (result) => {
                    if(result instanceof Error){ console.log(result) }
                })

            }else{
                otp_pass = machine.otp_pass?true:false
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

router.route('/reset_otp').post((req, res, next) => {
    var access_token = req.header('access_token')
    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    };

    jwt.verify(access_token, secret, (err, decode) => {
        if (err) {
            send.message = 'Incorrect access_token.'
            return res.json(send)
        }

        // check in db
        UsersModel.findUser(decode.username, (user) => {
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
            var possible = '0123456789'
            var otp = ""
            for (var i = 0; i < 6; i++)
                otp += possible.charAt(Math.floor(Math.random() * possible.length));

            // gen ref
            var ref = ""
            for (var i = 0; i < 4; i++)
                ref += possible.charAt(Math.floor(Math.random() * possible.length));

            // send sms
            send_sms(decode.username, 'ref='+ref+'\notp='+otp, (result) => {
                console.log(result)

                // update opt
                UsersModel.updateOtp(decode.username, otp, ref, (result) => {
                    if (result instanceof Error) {
                        send.message = 'Not found user.';
                        return res.json(send)
                    }

                    send.status = Enum.res_type.SUCCESS
                    send.info = { username: decode.username, ref: ref }
                    return res.json(send)
                })
            })
        })
    })
})

router.route('/otp').post((req, res, next) => {
    var data = req.body
    var access_token = req.header('access_token')
    var machine_token = req.header('machine_token')

    var schema = {
        "additionalProperties": false,
        "properties": {
            "otp": {
                "type": "string"
            },
        },
        "required": [ "otp" ]
    }
    var valid = ajv.validate(schema, data)
    if (!valid)
        return HttpStatus.send(res, 'BAD_REQUEST', { message: Util.toAjvResponse(ajv.errors) })

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    };

    jwt.verify(access_token, secret, (err, decode) => {
        if (err) {
            send.message = 'Incorrect access_token.'
            return res.json(send)
        }

        if(decode.otp_pass){
            send.status = Enum.res_type.SUCCESS
            send.info = { access_token: access_token }
            return res.json(send)
        }else{

            // check in db
            UsersModel.findUser(decode.username, (user) => {
                if (user == null) {
                    send.message = 'Incorrect otp. 1'
                    return res.json(send)
                } else if (user instanceof Error) {
                    send.message = 'Incorrect otp. 2';
                    return res.json(send)
                }

                if(user.otp != data.otp){
                    send.message = 'Incorrect otp. 3';
                    return res.json(send)
                }

                delete user.password
                delete user.otp

                // update otp machine
                UsersModel.updatePassMachine(machine_token, (result) => {
                    if(result instanceof Error){
                        send.message = 'Machine token not found.';
                        return res.json(send)
                    }

                    var expire = new Date()
                    expire.setMinutes(expire.getMinutes()+expire_time)
                    var access_token = jwt.sign({ username: user.username, otp_pass: true, expire: expire }, secret)

                    send.status = Enum.res_type.SUCCESS
                    send.info = { user: user, access_token: access_token, otp_pass: true, machine_token: machine_token };
                    return res.json(send)
                })
            })
        }
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
        var possible = '0123456789'
        var otp = ""
        for (var i = 0; i < 6; i++)
            otp += possible.charAt(Math.floor(Math.random() * possible.length));

        // gen ref
        var ref = ""
        for (var i = 0; i < 4; i++)
            ref += possible.charAt(Math.floor(Math.random() * possible.length));


        // send sms
        send_sms(data.phone_number, 'ref='+ref+'\notp='+otp, (result) => {
            console.log(result)

            // update opt
            UsersModel.updateOtp(data.phone_number, otp, ref, (result) => {
                if (user instanceof Error) {
                    send.message = 'Not found user.';
                    return res.json(send)
                }

                send.status = Enum.res_type.SUCCESS
                send.info = { username: data.username, ref: ref }
                return res.json(send)
            })
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
    var otp_token = req.header('otp_token')
    var schema = {
        "additionalProperties": false,
        "properties": {
            "new_pin": {
                "type": "string"
            },
        },
        "required": [ "new_pin" ]
    }
    var valid = ajv.validate(schema, data)
    if (!valid)
        return HttpStatus.send(res, 'BAD_REQUEST', { message: Util.toAjvResponse(ajv.errors) })

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    };

    jwt.verify(otp_token, secret, (err, decode) => {
        if(err){
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

function send_sms(number, text, done) {

    if(number.startsWith('0')){
        number = '66'+number.slice(1)
    }

    var message = windows874.encode(text);
    //var message = text.toString('utf-8')
    console.log(message)
    var options = {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        method: 'POST',
        url: 'http://corpsms.dtac.co.th/servlet/com.iess.socket.SmsCorplink',
        body: 'RefNo=100000'+'&Msn='+number+'&Msg='+message+'&Encoding=0'+'&MsgType=T'+'&User=api1618871'+'&Password=Dtac2016'+'&Sender=SMEsGoONL'
    };

    console.log(options)

    request(options, function (error, response, body) {
        if (error){
            return done(error)
        }
        return done(body)
    });
}

export default router
