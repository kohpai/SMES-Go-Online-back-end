'use strict'

import Ajv from 'ajv'
import HttpStatus from 'http-status-codes'
import Config from "../config";

var request = require("request")

const sendHttpStatus = (res, code, append) => {
  const msg = {
    error:{
      code: HttpStatus[code],
      message: HttpStatus.getStatusText(HttpStatus[code])
    }
  }
  if(append) Object.assign(msg, append);
  return res.status(HttpStatus[code]).json(msg)
}

const getUndefinedObject = (obj) => {
  for (let prop in obj){
    let type = typeof obj[prop]
    if (type == 'object') return getUndefinedObject(obj[prop])
    if (type == 'undefined') return prop
  }
  return null
}

const toAjvResponse = (msg_list) => {
  var res = []
  for(let index in msg_list){
    var el = msg_list[index]
    var tmp = {
      hint: el.schemaPath + (el.params.additionalProperty != undefined ? '/' + el.params.additionalProperty : "") + (el.params.type != undefined ? "/" + el.params.type : ""),
      message: el.message
    }
    res.push(tmp)
  }
  return res
}

const validInput = (schema, data) => {
  const ajv = new Ajv()
  const valid = ajv.validate(schema, data)
  if (!valid) return HttpStatus.send(res, 'BAD_REQUEST', { message: toAjvResponse(ajv.errors) })
}

const send_sms = (number, text, done) => {

    if(!Config.sms.enable){
        return done(null)
    }

    if(number.startsWith('0')){
        number = '66'+number.slice(1)
    }

    //var message = windows874.encode(text);
    var message = text.toString('utf-8')

    // var options = {
    //     headers: {
    //         'Content-Type': 'application/x-www-form-urlencoded'
    //     },
    //     method: 'POST',
    //     url: 'http://corpsms.dtac.co.th/servlet/com.iess.socket.SmsCorplink',
    //     body: 'RefNo=100000'+'&Msn='+number+'&Msg='+message+'&Encoding=0'+'&MsgType=T'+'&User=api1618871'+'&Password=Dtac2016'+'&Sender=SMEsGoONL'
    // };

    var options = {
        method: 'POST',
        url: Config.sms.url,
        headers:{
            'cache-control': 'no-cache'
        },
        formData: { 'msn': number, 'msg': message }
    };

    request(options, function (error, response, body) {
        if (error){
            return done(error)
        }
        return done(body)
    });
}

const check_recaptcha = (response, done) => {

    if(!Config.recaptcha.enable){
        return done({success: true})
    }

    var options = { method: 'POST',
        url: 'https://www.google.com/recaptcha/api/siteverify',
        headers:{
            'postman-token': 'ff986113-484d-dcdb-5bb2-4481c9c1a14e',
            'cache-control': 'no-cache',
            'content-type': 'multipart/form-data;' },
        formData:{
            secret: Config.pwd.recaptcha_secret,
            response: response,
            remoteip: '' }
    };

    request(options, function (error, response, body) {
        if (error)
            done(error)
        else
            done(body)
    });
}

export default {
    getUndefinedObject,
    toAjvResponse,
    validInput,
    send_sms,
    check_recaptcha,
}