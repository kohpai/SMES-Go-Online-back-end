'use strict'

// package
import { Router } from 'express'
import Ajv from 'ajv'
const router = new Router()
const ajv = new Ajv()

var jwt = require("jsonwebtoken")
const expire_time = 10 // minute
// using
import HttpStatus from './../helper/http_status.js'
import UsersModel from '../models/usersModel.js'
import { Util,Enum } from '../helper'
import Config from '../config.js'

router.route('/*').all((req, res, next) => {
    const access_token = req.header('access_token')
    const otp_token = req.header('otp_token')

    console.log(req.path)

    if(req.path.startsWith('/products') || req.path.startsWith('/news') ||
        req.path.startsWith('/consult') || req.path.startsWith('/profile') ||
        (req.path.startsWith('/faq') && req.method != 'GET') || (req.path.startsWith('/users') && req.method != 'POST') ){

        jwt.verify(access_token, Config.pwd.jwt_secret, (err, decode) => {
            if(err){
                return res.json({status: Enum.res_type.FAILURE, info:{}, message: 'The token is invalid.'})
            }
            if(!decode.otp_pass){
                return res.json({status: Enum.res_type.FAILURE, info:{}, message: 'The token is invalid.'})
            }
            // check expire
            var expire = new Date(decode.expire)
            var now = new Date()
            if(expire <= now){
                return res.json({status: Enum.res_type.FAILURE, info:{}, message: 'The token is invalid.'})
            }
            UsersModel.findUserByUsername(decode.username, (user) => {
                if(user instanceof Error){
                    return res.json({status: Enum.res_type.FAILURE, info:{}, message: 'The token is invalid.'})
                }

                req.user = user

                if(user.is_admin){
                    return next()
                }
                UsersModel.getEnterpriseByUserId(user.user_id, (ent) => {
                    if(ent instanceof Error){
                        return res.json({status: Enum.res_type.FAILURE, info:{}, message: 'The token is invalid.'})
                    }

                    req.user.ent = ent
                    return next()
                })
            })
        })

    }else if(req.path.startsWith('/otp') || req.path.startsWith('/reset_otp')){

        jwt.verify(access_token, Config.pwd.jwt_secret, (err, decode) => {
            if(err){
                return res.json({status: Enum.res_type.FAILURE, info:{}, message: 'The token is invalid.'})
            }
            return next()
        })

    }else if(req.path.startsWith("/set_pin")){
        jwt.verify(otp_token, Config.pwd.jwt_secret, (err, decode) => {
            if(err){
                return res.json({status: Enum.res_type.FAILURE, info:{}, message: 'The token is invalid.'})
            }
            var is_expire = new Date() > decode.expire
            if(is_expire){
                return res.json({status: Enum.res_type.FAILURE, info:{}, message: 'The token is invalid.'})
            }
            return next()
        })

    }else{
        return next()
    }
})

router.route('/status').get((req, res, next) => {
    const access_token = req.header('access_token')
    jwt.verify(access_token, Config.pwd.jwt_secret, (err, decode) => {
        if(err){
            return res.json({status: Enum.res_type.FAILURE, info:{}, message: 'The token is invalid.'})
        }

        // check expire
        var expire = new Date(decode.expire)
        var now = new Date()
        if(expire <= now){
            return res.json({status: Enum.res_type.FAILURE, info:{}, message: 'The token is expire.'})
        }

        var send = {
            status: Enum.res_type.FAILURE,
            info: {}
        };

        UsersModel.findUserByUsername(decode.username, (user) => {
            if(user instanceof Error){
                return res.json({status: Enum.res_type.FAILURE, info:{}, message: 'The token is invalid.'})
            }

            delete user.password
            delete user.otp

            if(user.is_admin){
                send.status = Enum.res_type.SUCCESS
                send.info = { user: user, access_token: access_token, otp_pass: decode.otp_pass };
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
                send.info = { user: user, access_token: access_token, ent_id: decode.ent_id, otp_pass: decode.otp_pass };
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
        return res.json({status: Enum.res_type.FAILURE, info:ajv.errors, message: 'bad request.'})

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    };

    UsersModel.authenUser(data.username, data.pin, (user) => {
        if (user == null || user.length == 0) {
            send.message = 'รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบ'
            return res.json(send)
        } else if (user instanceof Error) {
            send.message = 'รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบ'
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
                machine_token = jwt.sign({ created: new Date() }, Config.pwd.jwt_secret)

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

                if(machine.user_id != user.user_id){
                    otp_pass = false
                }

                // update machine
                UsersModel.updateMachine(machine_token, user.user_id, otp_pass, (result) => {
                    if(result instanceof Error){ console.log(result) }
                })
            }

            var expire = new Date()
            expire.setHours(expire.getHours()+Config.expire.login)
            var access_token = jwt.sign({ username: data.username, otp_pass: otp_pass, expire: expire }, Config.pwd.jwt_secret)

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

    jwt.verify(access_token, Config.pwd.jwt_secret, (err, decode) => {
        if (err) {
            return res.json({status: Enum.res_type.FAILURE, info:{}, message: 'The token is invalid.'})
        }

        // check expire
        var expire = new Date(decode.expire)
        var now = new Date()
        if(expire <= now){
            return res.json({status: Enum.res_type.FAILURE, info:{}, message: 'The token is expire.'})
        }

        // check in db
        UsersModel.findUserByUsername(decode.username, (user) => {
            if (user == null) {
                send.message = 'ไม่พบหมายเลขโทรศัพท์มือถือในระบบ กรุณาตรวจสอบ'
                return res.json(send)
            } else if (user instanceof Error) {
                send.message = 'ไม่พบหมายเลขโทรศัพท์มือถือในระบบ กรุณาตรวจสอบ';
                return res.json(send)
            }else if (user.length == 0) {
                send.message = 'ไม่พบหมายเลขโทรศัพท์มือถือในระบบ กรุณาตรวจสอบ';
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
            var message = Config.wording.sms_otp
            message = message.replace('{{otp}}', otp)
            message = message.replace('{{ref}}', ref)
            Util.send_sms(decode.username, message, (result) => {

                // update opt
                UsersModel.updateOtp(decode.username, otp, ref, (result) => {
                    if (result instanceof Error) {
                        send.message = 'ไม่พบหมายเลขโทรศัพท์มือถือในระบบ กรุณาตรวจสอบ';
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
        return res.json({status: Enum.res_type.FAILURE, info:ajv.errors, message: 'bad request.'})

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    };

    jwt.verify(access_token, Config.pwd.jwt_secret, (err, decode) => {
        if (err) {
            return res.json({status: Enum.res_type.FAILURE, info:{}, message: 'The token is invalid.'})
        }

        // check expire
        var expire = new Date(decode.expire)
        var now = new Date()
        if(expire <= now){
            return res.json({status: Enum.res_type.FAILURE, info:{}, message: 'หมายเลข OTP ไม่ถูกต้อง กรุณาตรวจสอบ'})
        }

        if(decode.otp_pass){
            send.status = Enum.res_type.SUCCESS
            send.info = { access_token: access_token }
            return res.json(send)
        }else{

            // check in db
            UsersModel.findUserByUsername(decode.username, (user) => {
                if (user == null) {
                    send.message = 'หมายเลข OTP ไม่ถูกต้อง กรุณาตรวจสอบ'
                    return res.json(send)
                } else if (user instanceof Error) {
                    send.message = 'หมายเลข OTP ไม่ถูกต้อง กรุณาตรวจสอบ';
                    return res.json(send)
                }

                // check otp expire
                var expire = new Date(user.otp_gen)
                var now = new Date()
                expire.setMinutes(expire.getMinutes() + Config.expire.otp)
                if(expire <= now){
                    return res.json({status: Enum.res_type.FAILURE, info:{}, message: 'The token is expire.'})
                }

                if(user.otp != data.otp){
                    send.message = 'หมายเลข OTP ไม่ถูกต้อง กรุณาตรวจสอบ';
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
                    expire.setHours(expire.getHours()+Config.expire.login)
                    var access_token = jwt.sign({ username: user.username, otp_pass: true, expire: expire }, Config.pwd.jwt_secret)

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
        return res.json({status: Enum.res_type.FAILURE, info:ajv.errors, message: 'bad request.'})

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
    UsersModel.findUserByUsername(data.phone_number, (user) => {
        if (user == null) {
            send.message = 'ไม่พบหมายเลขโทรศัพท์มือถือในระบบ กรุณาตรวจสอบ'
            return res.json(send)
        } else if (user instanceof Error) {
            send.message = 'ไม่พบหมายเลขโทรศัพท์มือถือในระบบ กรุณาตรวจสอบ';
            return res.json(send)
        }else if (user.length == 0) {
            send.message = 'ไม่พบหมายเลขโทรศัพท์มือถือในระบบ กรุณาตรวจสอบ';
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
        var message = Config.wording.sms_otp
        message = message.replace('{{otp}}', otp)
        message = message.replace('{{ref}}', ref)
        Util.send_sms(data.phone_number, message, (result) => {
            // update opt
            UsersModel.updateOtp(data.phone_number, otp, ref, (result) => {
                if (user instanceof Error) {
                    send.message = 'ไม่พบหมายเลขโทรศัพท์มือถือในระบบ กรุณาตรวจสอบ'
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
        return res.json({status: Enum.res_type.FAILURE, info:ajv.errors, message: 'bad request.'})

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    };

    // check in db
    UsersModel.findUserByUsername(data.phone_number, (user) => {
        if (user == null) {
            send.message = 'หมายเลข OTP ไม่ถูกต้อง กรุณาตรวจสอบ'
            return res.json(send)
        } else if (user instanceof Error) {
            send.message = 'หมายเลข OTP ไม่ถูกต้อง กรุณาตรวจสอบ';
            return res.json(send)
        }else if (user.length == 0) {
            send.message = 'หมายเลข OTP ไม่ถูกต้อง กรุณาตรวจสอบ';
            return res.json(send)
        }

        // check otp expire
        var expire = new Date(user.otp_gen)
        var now = new Date()
        expire.setMinutes(expire.getMinutes() + Config.expire.otp)
        console.log(expire)
        console.log(now)
        if(expire <= now){
            return res.json({status: Enum.res_type.FAILURE, info:{}, message: 'หมายเลข OTP ไม่ถูกต้อง กรุณาตรวจสอบ'})
        }

        if(user.otp != data.otp){
            send.message = 'หมายเลข OTP ไม่ถูกต้อง กรุณาตรวจสอบ';
            return res.json(send)
        }

        var expire = new Date()
        expire.setMinutes(expire.getMinutes()+Config.expire.otp_token)
        var otp_token = jwt.sign({ username: data.phone_number, otp_pass: true, expire: expire}, Config.pwd.jwt_secret)

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
        return res.json({status: Enum.res_type.FAILURE, info:ajv.errors, message: 'bad request.'})

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    };

    jwt.verify(otp_token, Config.pwd.jwt_secret, (err, decode) => {
        if(err){
            return res.json({status: Enum.res_type.FAILURE, info:{}, message: 'The token is invalid.'})
        }

        // check expire
        var expire = new Date(decode.expire)
        var now = new Date()
        console.log(expire)
        console.log(now)
        if(expire <= now){
            return res.json({status: Enum.res_type.FAILURE, info:{}, message: 'The token is expire.'})
        }

        // update pin
        UsersModel.updatePin(decode.username, data.new_pin, (result) => {
            if (result instanceof Error) {
                send.message = 'ไม่พบหมายเลขโทรศัพท์มือถือในระบบ กรุณาตรวจสอ';
                return res.json(send)
            }

            send.status = Enum.res_type.SUCCESS
            send.message = 'success';
            return res.json(send)
        })

    })
})

export default router
