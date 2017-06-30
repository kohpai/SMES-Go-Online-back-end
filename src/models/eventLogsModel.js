'use strict'

// import
import DB from '../db.js'
import { Util, Enum } from '../helper'
import { ObjectID } from 'mongodb'

const collectionName = 'event_logs'

const attendance = (data, event_type, done) => {
  var event_logs = DB.get().collection(collectionName)
  var query = {
    user_id: new ObjectID(data.user_id),
    time_year: new Date(data.att_time).getUTCFullYear(),
    time_month: new Date(data.att_time).getUTCMonth()+1
  }
  var update = {
    $push:{
      attendance: {
        event_type: event_type,
        area_type: data.area_type,
        att_type: data.att_type,
        note: data.note,
        location:{
          type: 'Point',
          coordinates: [data.location.lng, data.location.lat]
        },
        att_time: data.att_time,
      }
    }
  }
  event_logs.findOneAndUpdate(query, update, {upsert: true, new: true, _setDefaultsOnInsert: true}, (err, rest) => {
    done(rest)
  });
}

const createCheckin = (data, done) => {
  attendance(data, Enum.event_type.CHECKIN, (rest) => {
    done(rest)
  })
}

const createCheckout = (data, done) => {
  attendance(data, Enum.event_type.CHECKOUT, (rest) => {
    done(rest)
  })
}

const getEventLogsByUserAndTime = (data, done) => {
  var event_logs = DB.get().collection(collectionName)
  var query = {
    user_id: new ObjectID(data.user_id),
    time_month: data.time_month,
    time_year: data.time_year
  }
  // console.log(query)
  event_logs.findOne(query, {}, (err, rest) => {
    done(rest)
  })
}

export default {
  createCheckin,
  createCheckout,
  getEventLogsByUserAndTime
}