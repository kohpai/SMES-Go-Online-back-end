'use strict'

// package
import { Router } from 'express'
import Ajv from 'ajv'
const router = new Router()
const ajv = new Ajv()

import Syslog from '../log.js'

const crypto = require('crypto');

var jwt = require("jsonwebtoken")

// using
import HttpStatus from './../helper/http_status.js'
import UsersModel from '../models/usersModel.js'
import { Util,Enum } from '../helper'
import Config from '../config.js'

router.route('/*').all((req, res, next) => {
    const access_token = req.header('access_token')
    const otp_token = req.header('otp_token')

    console.log(req.method+' : '+req.path)
    Syslog.info(req.method+' : '+req.path)

    if(req.path.startsWith('/products') ||
        req.path.startsWith('/news') ||
        req.path.startsWith('/consult') ||
        req.path.startsWith('/profile') ||
        (req.path.startsWith('/faq') && req.method != 'GET') ||
        req.path.startsWith('/users/import') ||
        req.path.startsWith('/users/name') ||
        (req.path.startsWith('/users') && req.method != 'POST') ||
        req.path.startsWith('/admin') ||
        req.path.startsWith('/import') ||
        req.path.startsWith('/set_phone') ||
        req.path.startsWith('/change_password') ||
        req.path.startsWith('/userinfo') ||
        req.path.startsWith('/oauth')
    ){

        jwt.verify(access_token, Config.pwd.jwt_secret, (err, decode) => {
            if(err){
                return res.json({status: Enum.res_type.FAILURE, info:{}, message: Config.wording.token_invalid})
            }
            if(!decode.otp_pass){
                return res.json({status: Enum.res_type.FAILURE, info:{}, message: Config.wording.token_invalid})
            }
            // check expire
            var expire = new Date(decode.expire)
            var now = new Date()
            if(expire <= now){
                return res.json({status: Enum.res_type.FAILURE, info:{}, message: Config.wording.token_expire})
            }
            UsersModel.findUser(decode.user_id, (user) => {
                if(user instanceof Error){
                    return res.json({status: Enum.res_type.FAILURE, info:{}, message: Config.wording.not_found_user})
                }

                req.user = user

                if(user.is_admin){
                    UsersModel.detailRole(user.role_id, (role) => {
                        if (role instanceof Error) {
                            return res.json({status: Enum.res_type.FAILURE, info:{}, message: 'not found role'})
                        }

                        req.user.role = role
                        return next()
                    })
                }else{
                    UsersModel.getEnterpriseByUserId(user.user_id, (ent) => {
                        if(ent instanceof Error){
                            return res.json({status: Enum.res_type.FAILURE, info:{}, message: Config.wording.not_found_enterprise})
                        }

                        req.user.ent = ent
                        return next()
                    })
                }
            })
        })

    }else if(req.path.startsWith('/otp') || req.path.startsWith('/reset_otp')){

        jwt.verify(access_token, Config.pwd.jwt_secret, (err, decode) => {
            if(err){
                return res.json({status: Enum.res_type.FAILURE, info:{}, message: Config.wording.token_invalid})
            }
            return next()
        })

    }else if(req.path.startsWith("/set_pin")){
        jwt.verify(otp_token, Config.pwd.jwt_secret, (err, decode) => {
            if(err){
                return res.json({status: Enum.res_type.FAILURE, info:{}, message: Config.wording.token_invalid})
            }
            var is_expire = new Date() > decode.expire
            if(is_expire){
                return res.json({status: Enum.res_type.FAILURE, info:{}, message: Config.wording.token_expire})
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
            return res.json({status: Enum.res_type.FAILURE, info:{}, message: Config.wording.token_invalid})
        }

        // check expire
        var expire = new Date(decode.expire)
        var now = new Date()
        if(expire <= now){
            return res.json({status: Enum.res_type.FAILURE, info:{}, message: Config.wording.token_expire})
        }

        var send = {
            status: Enum.res_type.FAILURE,
            info: {}
        };

        UsersModel.findUser(decode.user_id, (user) => {
            if(user instanceof Error){
                return res.json({status: Enum.res_type.FAILURE, info:{}, message: Config.wording.not_found_user})
            }

            delete user.password
            delete user.otp

            if(user.is_admin){
                UsersModel.detailRole(user.role_id, (role) => {
                    if (role instanceof Error) {
                        send.status = Enum.res_type.FAILURE;
                        send.message = user;
                        return res.json(send);
                    }

                    user.role = role

                    send.status = Enum.res_type.SUCCESS
                    send.info = { user: user, access_token: access_token, otp_pass: decode.otp_pass };
                    return res.json(send)
                })

            }else{
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
            }
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
            },
            'recaptcha': {
                'type': 'string'
            }
        },
        "required": [ "username", "pin" ]
    }
    var valid = ajv.validate(schema, data)
    if (!valid)
        return res.json({status: Enum.res_type.FAILURE, info:ajv.errors, message: Config.wording.bad_request})

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    };

    Util.check_recaptcha(data.recaptcha, (recaptcha) => {
        if (recaptcha instanceof Error) {
            return res.json({status: Enum.res_type.FAILURE, info: recaptcha, message: 'fail recaptcha.1'})
        }

        if (!recaptcha.success) {
            return res.json({status: Enum.res_type.FAILURE, info: recaptcha, message: 'fail recaptcha.'})
        }

        var hash = crypto.createHmac('sha256', Config.pwd.sha256_secret).update(data.pin).digest('hex');

        UsersModel.authenUser(data.username, hash, (user) => {
            if (user == null || user.length == 0) {
                send.message = Config.wording.password_incorrect
                return res.json(send)
            } else if (user instanceof Error) {
                send.message = Config.wording.password_incorrect
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
                    machine_token = jwt.sign({created: new Date()}, Config.pwd.jwt_secret)

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
                        if (result instanceof Error) {

                        }
                    })

                } else {
                    otp_pass = machine.otp_pass ? true : false
                    machine_token = data.machine_token

                    if (machine.user_id != user.user_id) {
                        otp_pass = false
                    }

                    // update machine
                    UsersModel.updateMachine(machine_token, user.user_id, otp_pass, (result) => {
                        if (result instanceof Error) {

                        }
                    })
                }

                var expire = new Date()
                expire.setHours(expire.getHours() + Config.expire.login)
                var access_token = jwt.sign({
                    user_id: user.user_id,
                    otp_pass: otp_pass,
                    expire: expire
                }, Config.pwd.jwt_secret)

                send.status = Enum.res_type.SUCCESS
                send.info = {user: user, access_token: access_token, otp_pass: otp_pass, machine_token: machine_token};

                return res.json(send)
            })
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
            return res.json({status: Enum.res_type.FAILURE, info:{}, message: Config.wording.token_invalid})
        }

        // check expire
        var expire = new Date(decode.expire)
        var now = new Date()
        if(expire <= now){
            return res.json({status: Enum.res_type.FAILURE, info:{}, message: Config.wording.token_expire})
        }

        // check in db
        UsersModel.findUser(decode.user_id, (user) => {
            if (user == null) {
                send.message = Config.wording.not_found_phone
                return res.json(send)
            } else if (user instanceof Error) {
                send.message = Config.wording.not_found_phone
                return res.json(send)
            }else if (user.length == 0) {
                send.message = Config.wording.not_found_phone
                return res.json(send)
            }

            // check otp_gen
            var expire = new Date(user.otp_gen)
            expire.setMinutes(expire.getMinutes()+Config.expire.otp_gen)
            var now = new Date()
            if(expire >= now){
                return res.json({status: Enum.res_type.FAILURE, info:{}, message: Config.wording.otp_gen_already})
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
            Util.send_sms(user.username, message, (result) => {

                // update opt
                UsersModel.updateOtp(user.username, otp, ref, (result) => {
                    if (result instanceof Error) {
                        send.message = Config.wording.not_found_phone;
                        return res.json(send)
                    }

                    send.status = Enum.res_type.SUCCESS
                    send.info = { username: user.username, ref: ref }
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
        return res.json({status: Enum.res_type.FAILURE, info:ajv.errors, message: Config.wording.bad_request})

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    };

    jwt.verify(access_token, Config.pwd.jwt_secret, (err, decode) => {
        if (err) {
            return res.json({status: Enum.res_type.FAILURE, info:{}, message: Config.wording.token_invalid})
        }

        // check expire
        var expire = new Date(decode.expire)
        var now = new Date()
        if(expire <= now){
            return res.json({status: Enum.res_type.FAILURE, info:{}, message: Config.wording.token_expire})
        }

        if(decode.otp_pass){
            send.status = Enum.res_type.SUCCESS
            send.info = { access_token: access_token }
            return res.json(send)
        }else{

            // check in db
            UsersModel.findUser(decode.user_id, (user) => {
                if (user == null) {
                    send.message = Config.wording.not_found_user
                    return res.json(send)
                } else if (user instanceof Error) {
                    send.message = Config.wording.not_found_user;
                    return res.json(send)
                }

                // check otp expire
                var expire = new Date(user.otp_gen)
                var now = new Date()
                expire.setMinutes(expire.getMinutes() + Config.expire.otp)
                if(expire <= now){
                    return res.json({status: Enum.res_type.FAILURE, info:{}, message: Config.wording.otp_incorrect})
                }

                if(user.otp != data.otp){
                    send.message = Config.wording.otp_incorrect
                    return res.json(send)
                }

                delete user.password
                delete user.otp

                // update otp machine
                UsersModel.updatePassMachine(machine_token, (result) => {
                    if(result instanceof Error){
                        send.message = Config.wording.not_found_machine_token;
                        return res.json(send)
                    }

                    var expire = new Date()
                    expire.setHours(expire.getHours()+Config.expire.login)
                    var access_token = jwt.sign({ user_id: user.user_id, otp_pass: true, expire: expire }, Config.pwd.jwt_secret)

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
            'recaptcha': {
                'type': 'string'
            }
        },
        "required": [ "phone_number" ]
    }
    var valid = ajv.validate(schema, data)
    if (!valid)
        return res.json({status: Enum.res_type.FAILURE, info:ajv.errors, message: Config.wording.bad_request})

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    };

    Util.check_recaptcha(data.recaptcha, (recaptcha) => {
        if (recaptcha instanceof Error) {
            return res.json({status: Enum.res_type.FAILURE, info: recaptcha, message: 'fail recaptcha.'})
        }

        if (!recaptcha.success) {
            return res.json({status: Enum.res_type.FAILURE, info: recaptcha, message: 'fail recaptcha.'})
        }

        if (data.phone_number.startsWith('66')) {
            data.phone_number = '0' + data.phone_number.slice(2)
        } else if (data.phone_number.startsWith('+66')) {
            data.phone_number = '0' + data.phone_number.slice(3)
        }

        // check in db
        UsersModel.findUserByUsername(data.phone_number, (user) => {
            if (user == null) {
                send.message = Config.wording.not_found_phone
                return res.json(send)
            } else if (user instanceof Error) {
                send.message = Config.wording.not_found_phone
                return res.json(send)
            } else if (user.length == 0) {
                send.message = Config.wording.not_found_phone
                return res.json(send)
            }

            // check otp_gen
            var expire = new Date(user.otp_gen)
            expire.setMinutes(expire.getMinutes() + Config.expire.otp_gen)
            var now = new Date()
            if (expire >= now) {
                return res.json({status: Enum.res_type.FAILURE, info: {}, message: Config.wording.otp_gen_already})
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
                    if (result instanceof Error) {
                        send.message = Config.wording.not_found_user
                        return res.json(send)
                    }

                    send.status = Enum.res_type.SUCCESS
                    send.info = {username: data.username, ref: ref}
                    return res.json(send)
                })
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
            }
        },
        "required": [ "phone_number", "otp" ]
    }
    var valid = ajv.validate(schema, data)
    if (!valid)
        return res.json({status: Enum.res_type.FAILURE, info:ajv.errors, message: Config.wording.bad_request})

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    };

    // check in db
    UsersModel.findUserByUsername(data.phone_number, (user) => {
        if (user == null) {
            send.message = Config.wording.otp_incorrect
            return res.json(send)
        } else if (user instanceof Error) {
            send.message = Config.wording.otp_incorrect
            return res.json(send)
        } else if (user.length == 0) {
            send.message = Config.wording.otp_incorrect
            return res.json(send)
        }

        // check otp expire
        var expire = new Date(user.otp_gen)
        var now = new Date()
        expire.setMinutes(expire.getMinutes() + Config.expire.otp)
        if (expire <= now) {
            return res.json({status: Enum.res_type.FAILURE, info: {}, message: Config.wording.otp_incorrect})
        }

        if (user.otp != data.otp) {
            send.message = Config.wording.otp_incorrect;
            return res.json(send)
        }

        var expire = new Date()
        expire.setMinutes(expire.getMinutes() + Config.expire.otp_token)
        var otp_token = jwt.sign({
            user_id: user.user_id,
            otp_pass: true,
            expire: expire
        }, Config.pwd.jwt_secret)

        send.status = Enum.res_type.SUCCESS
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
            }
        },
        "required": [ "new_pin" ]
    }
    var valid = ajv.validate(schema, data)
    if (!valid)
        return res.json({status: Enum.res_type.FAILURE, info:ajv.errors, message: Config.wording.bad_request})

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    };

    jwt.verify(otp_token, Config.pwd.jwt_secret, (err, decode) => {
        if (err) {
            return res.json({status: Enum.res_type.FAILURE, info: {}, message: Config.wording.token_invalid})
        }

        // check expire
        var expire = new Date(decode.expire)
        var now = new Date()
        if (expire <= now) {
            return res.json({status: Enum.res_type.FAILURE, info: {}, message: Config.wording.token_expire})
        }

        var hash = crypto.createHmac('sha256', Config.pwd.sha256_secret).update(data.new_pin).digest('hex');

        // update pin
        UsersModel.updatePin(decode.user_id, hash, (result) => {
            if (result instanceof Error) {
                send.message = Config.wording.not_found_phone;
                return res.json(send)
            }

            send.status = Enum.res_type.SUCCESS
            send.message = 'success';
            return res.json(send)
        })

    })
})

router.route('/set_phone/send_otp').post((req, res, next) => {
    var data = req.body
    var schema = {
        "additionalProperties": false,
        "properties": {
            "phone_number": {
                "type": "string"
            }
        },
        "required": [ "phone_number" ]
    }
    var valid = ajv.validate(schema, data)
    if (!valid)
        return res.json({status: Enum.res_type.FAILURE, info:ajv.errors, message: Config.wording.bad_request})

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    };

    if (data.phone_number.startsWith('66')) {
        data.phone_number = '0' + data.phone_number.slice(2)
    } else if (data.phone_number.startsWith('+66')) {
        data.phone_number = '0' + data.phone_number.slice(3)
    }

    // check otp_gen
    var expire = new Date(req.user.otp_gen)
    expire.setMinutes(expire.getMinutes() + Config.expire.otp_gen)
    var now = new Date()
    if (expire >= now) {
        return res.json({status: Enum.res_type.FAILURE, info: {}, message: Config.wording.otp_gen_already})
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
        UsersModel.updateOtp(req.user.username, otp, ref, (result) => {
            if (result instanceof Error) {
                send.message = Config.wording.not_found_user
                return res.json(send)
            }

            send.status = Enum.res_type.SUCCESS
            send.info = {username: data.username, ref: ref}
            return res.json(send)
        })
    })
})

router.route('/set_phone/check_otp').post((req, res, next) => {
    var data = req.body
    var schema = {
        "additionalProperties": false,
        "properties": {
            "phone_number": {
                "type": "string"
            },
            "otp": {
                "type": "string"
            }
        },
        "required": [ "phone_number", "otp" ]
    }
    var valid = ajv.validate(schema, data)
    if (!valid)
        return res.json({status: Enum.res_type.FAILURE, info:ajv.errors, message: Config.wording.bad_request})

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    };

    // check otp expire
    var expire = new Date(req.user.otp_gen)
    var now = new Date()
    expire.setMinutes(expire.getMinutes() + Config.expire.otp)
    if (expire <= now) {
        return res.json({status: Enum.res_type.FAILURE, info: {}, message: Config.wording.otp_incorrect})
    }

    if (req.user.otp != data.otp) {
        send.message = Config.wording.otp_incorrect;
        return res.json(send)
    }

    // update opt
    UsersModel.updatePhone(req.user.user_id, data.phone_number, (result) => {
        if (result instanceof Error) {
            send.message = Config.wording.already_phone
            send.info = result
            return res.json(send)
        }

        send.status = Enum.res_type.SUCCESS
        send.info = result
        return res.json(send)
    })
})

router.route('/change_password').put((req, res, next) => {
    var data = req.body
    var schema = {
        "additionalProperties": false,
        "properties": {
            "new_pin": {
                "type": "string"
            },
            'old_pin': {
                'type': 'string'
            }
        },
        "required": [ "new_pin","old_pin" ]
    }
    var valid = ajv.validate(schema, data)
    if (!valid)
        return res.json({status: Enum.res_type.FAILURE, info:ajv.errors, message: Config.wording.bad_request})

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    };

    var hash = crypto.createHmac('sha256', Config.pwd.sha256_secret).update(data.old_pin).digest('hex');
    var new_hash = crypto.createHmac('sha256', Config.pwd.sha256_secret).update(data.new_pin).digest('hex');

    UsersModel.authenUser(req.user.username, hash, (user) => {
        if (user == null || user.length == 0) {
            send.message = Config.wording.password_incorrect
            return res.json(send)
        } else if (user instanceof Error) {
            send.message = Config.wording.password_incorrect
            return res.json(send)
        }

        // update pin
        UsersModel.updatePin(req.user.user_id, new_hash, (result) => {
            if (result instanceof Error) {
                send.message = Config.wording.not_found_phone;
                return res.json(send)
            }

            send.status = Enum.res_type.SUCCESS
            send.message = 'success';
            return res.json(send)
        })
    })
})

export default router
