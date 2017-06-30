'use strict'

import Ajv from 'ajv'
import HttpStatus from 'http-status-codes'

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

export default {
  getUndefinedObject,
  toAjvResponse,
  validInput
}