'use strict'

// package
import { Router } from 'express'
const router = new Router()
import Ajv from 'ajv'
const ajv = new Ajv()

// using
import HttpStatus from './../helper/http_status.js'
import UsersModel from '../models/usersModel.js'
import CompanyModel from '../models/companyModel.js'
import EventLogsModel from '../models/eventLogsModel.js'
import EventStatusModel from '../models/eventStatusModel.js'
import { Util, Enum } from '../helper'


/* further work
   - catch error
*/
router.route('/company').post((req, res, next) => {
  // try {
    var data = req.body
    var schema = {
      "additionalProperties": false,
      "properties": {
        "user_id": {
          "type": "string"
        }
      },
      "required": [ "user_id" ]
    }
    var valid = ajv.validate(schema, data)
    if (!valid) return HttpStatus.send(res, 'BAD_REQUEST', { message: Util.toAjvResponse(ajv.errors) })

    var send = {
      status: Enum.res_type.FAILURE,
      info: {}
    }
    UsersModel.getUserById(data.user_id, (user) => {
      if (user == null){
         send.status = Enum.res_type.FAILURE
         send.message = 'unknow user_id '+data.user_id
         return res.json(send)
      }
      CompanyModel.getCompanyById(user.info.company_id, (company) => {
        if (company == null) {
          send.status = Enum.res_type.SUCCESS
          send.message = 'not found user company'
          send.info = {}
          return res.json(send)
        }
        send.status = Enum.res_type.SUCCESS
        send.info = Object.assign({}, company)
        send.info.location = {
          lat: company.location.coordinates[1],
          lng: company.location.coordinates[0]
        }
        return res.json(send)
      })
    })
  // }
  // catch(error){
  //   return HttpStatus.send(res, 'INTERNAL_SERVER_ERROR')
  // }
})

router.route('/history').post((req, res, next) => {
  // try {
    var data = req.body
    var schema = {
      "additionalProperties": false,
      "properties": {
        "user_id": {
          "type": "string"
        },
        "time_month": {
          "type": "number"
        },
        "time_year": {
          "type": "number"
        }
      },
      "required": [ "user_id", "time_month", "time_year" ]
    }
    var valid = ajv.validate(schema, data)
    if (!valid) return HttpStatus.send(res, 'BAD_REQUEST', { message: Util.toAjvResponse(ajv.errors) })

    var query = {
      user_id: data.user_id,
      time_month: data.time_month,
      time_year: data.time_year
    }
    var send = {
      status: Enum.res_type.FAILURE,
      info: {}
    }
    EventLogsModel.getEventLogsByUserAndTime(query, (history) => {
      if(history == null){
        send.status = Enum.res_type.SUCCESS
        send.message = "Can't found history"
        return res.json(send)
      }
      send.status = Enum.res_type.SUCCESS
      send.info = Object.assign({}, history)
      return res.json(send)
    })
  // }
  // catch(error){
  //   return HttpStatus.send(res, 'INTERNAL_SERVER_ERROR')
  // }
})

router.route('/status').post((req, res, next) => {
  // try {
    var data = req.body
    var schema = {
      "additionalProperties": false,
      "properties": {
        "user_id": {
          "type": "string"
        }
      },
      "required": [ "user_id" ]
    }
    var valid = ajv.validate(schema, data)
    if (!valid) return HttpStatus.send(res, 'BAD_REQUEST', { message: Util.toAjvResponse(ajv.errors) })

    var send = {
      status: Enum.res_type.FAILURE,
      info: {}
    }
    EventStatusModel.getEventStatusByUserId(data.user_id, (event) => {
      if(event == null){
        send.status = Enum.res_type.SUCCESS
        send.message = "First time"
        send.info = {}
        return res.json(send)
      }
      send.status = Enum.res_type.SUCCESS
      delete event._id
      delete event.user_id
      send.info = Object.assign({}, event)
      return res.json(send)
    })
  // }
  // catch(error){
  //   return HttpStatus.send(res, 'INTERNAL_SERVER_ERROR')
  // }
})

export default router