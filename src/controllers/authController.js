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
  console.log(req.originaladdUrl)
  // console.log(req.path)g
  console.log(req.body)
  const token = req.body.acc_token
  delete req.body.acc_token

  if(token != 'xxx') return HttpStatus.send(res, 'UNAUTHORIZED', { message: 'The token is invalid.' })
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
    if (!valid) return HttpStatus.send(res, 'BAD_REQUEST', { message: Util.toAjvResponse(ajv.errors) })

    var send = {
      status: Enum.res_type.FAILURE,
      info: {}
    }
    UsersModel.getUserByUsernameAndPassword(data.username, data.password, (user) => {
      if (user == null) {
        send.status = Enum.res_type.FAILURE
        send.message = 'Incorrect username or password.'
        send.info = {}
        return res.json(send)
      }
      send.status = Enum.res_type.SUCCESS
      send.info._id = user._id
      send.info = Object.assign(send.info, user.info)
      delete send.info.company_id
      send.info.acc_token = 'xxx'
      return res.json(send)
    })
  // }
  // catch(error){
  //   return HttpStatus.send(res, 'INTERNAL_SERVER_ERROR')
  // }
})

export default router