'use strict'

// package
import { Router } from 'express'
const router = new Router()
import Ajv from 'ajv'
const ajv = new Ajv()
import Geolib from 'geolib'

// using
import HttpStatus from './../helper/http_status.js'
import EventLogsModel from '../models/eventLogsModel.js'
import EventStatusModel from '../models/eventStatusModel.js'
import CompanyModel from '../models/companyModel.js'
import UsersModel from '../models/usersModel.js'
import { Util, Enum } from '../helper'

// const findCompanyInArea = (location, radius, done) => {
//   // var company =
//   CompanyModel.findInArea(location, area, (rest) => {
//       var company = rest
//   })
// }

router.route('/system_time').post((req, res, next) => {
  return res.json({system_time: new Date().toISOString()})
});

router.route('/check(in|out)').post((req, res, next) => {
  // try {
    var check_mode = req.path
    if(check_mode == '/checkin'){
      check_mode = Enum.event_type.CHECKIN
    }
    else if(check_mode == '/checkout'){
      check_mode = Enum.event_type.CHECKOUT
    }
    else{
      return res.send('Server Error!!')
    }

    var data = req.body
    var schema = {
      "additionalProperties": false,
      "properties": {
        "user_id": {
          "type": "string"
        },
        "area_type": {
          "type": "string"
        },
        "location": {
          "type": "object",
          "additionalProperties": false,
          "properties": {
            "lat": {
              "type": "number"
            },
            "lng": {
              "type": "number"
            },
          }
        },
        "note": {
          "type": "string"
        },
      },
      "required": [ "user_id", "area_type", "location" ]
    }
    var valid = ajv.validate(schema, data)
    if (!valid) return HttpStatus.send(res, 'BAD_REQUEST', { message: Util.toAjvResponse(ajv.errors) })

    data.att_time = new Date().toISOString()

    var checkinTimeType = (now_time_str, time_offset) => {
      const now = new Date(now_time_str)
      // console.log('checkin_time', now)

      const init_date = new Date(); init_date.setUTCHours(0,0,0,0)
      // console.log('init_time', init_date)

      const start_time = new Date(init_date.toISOString()); start_time.setUTCMinutes(time_offset.start)
      const late_time = new Date(init_date.toISOString()); late_time.setUTCMinutes(time_offset.late)
      // console.log('start_time', start_time)
      // console.log('late_time', late_time)

      const now_min = now.getTime()
      if(now_min <= start_time.getTime()) return Enum.att_checkin_type.PRESENT
      else if(now_min <= late_time.getTime()) return Enum.att_checkin_type.LATE
      else if(now_min > late_time.getTime()) return Enum.att_checkin_type.ABSENT
      else return res.send('Server Error!!')
    }

    var checkoutTimeType = (now_time_str, time_offset) => {
      const now = new Date(now_time_str)
      // console.log('checkout_time', now)

      const init_date = new Date(); init_date.setUTCHours(0,0,0,0)
      // console.log('init_time', init_date)

      const start_time = new Date(init_date.toISOString()); start_time.setUTCMinutes(time_offset.start)
      const end_time = new Date(init_date.toISOString()); end_time.setUTCMinutes(time_offset.end)
      // console.log('end_time', end_time)

      const now_min = now.getTime()
      if(now_min <= end_time.getTime()) return Enum.att_checkout_type.EARLY
      else if(now_min > end_time.getTime()) return Enum.att_checkout_type.LATE
      else return res.send('Server Error!!')
    }

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
        if (company == null){
          send.status = Enum.res_type.FAILURE
          send.message = 'not found user company'
          return res.json(send)
        }
        company.location = {
          lng: company.location.coordinates[0],
          lat: company.location.coordinates[1]
        }

        if(check_mode == Enum.event_type.CHECKIN){
          data.att_type = checkinTimeType(data.att_time, company.att_time_offset)
          // console.log('in')
        }
        else if(check_mode == Enum.event_type.CHECKOUT){
          data.att_type = checkoutTimeType(data.att_time, company.att_time_offset)
          // console.log('out')
        }

        if(data.area_type == Enum.area_type.OFFICE){
          var distance = Geolib.getDistanceSimple(
            {latitude: company.location.lat, longitude: company.location.lng},
            {latitude: data.location.lat, longitude: data.location.lng}
          );

          if (distance > company.location_redius_offset){
            return res.json({
              status: Enum.res_type.FAILURE,
              message: 'out of office area about '+distance+' meter',
              info:{
                from_here: distance
              }
            })
          }
        }
        else if(data.area_type == Enum.area_type.OUTSIDE){

        }
        else{
          send.status = Enum.res_type.FAILURE
          send.message = 'Something went wrong.'
          return res.json(send)
        }

        var check_reqult = {
          user_id: data.user_id,
          area_type: data.area_type,
          location: data.location,
          att_type: data.att_type,
          att_time: data.att_time,
          note: data.note
        }
        var query = Object.assign({user_id: data.user_id}, check_reqult)
        send.status = Enum.res_type.SUCCESS
        send.info = Object.assign({}, check_reqult)
        delete send.info.status
        delete send.user_id
        if(check_mode == Enum.event_type.CHECKIN){
          EventLogsModel.createCheckin(query, (rest) => {

          })
          EventStatusModel.updateEventStatus(check_reqult, Enum.event_type.CHECKIN, (rest) => {

          })
          // console.log('in')
          return res.json(send)
        }
        else if(check_mode == Enum.event_type.CHECKOUT){
          EventLogsModel.createCheckout(query, (rest) => {

          })
          EventStatusModel.updateEventStatus(check_reqult, Enum.event_type.CHECKOUT, (rest) => {

          })
          // console.log('out')
          return res.json(send)
        }
        else{
          return res.send('Server Error!!')
        }

      })
    })
  //  }

})

// router.route('/checkout').post(check)

export default router