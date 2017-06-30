'use strict'

// import
import DB from '../db.js'
import { Util, Enum } from '../helper'
import { ObjectID } from 'mongodb'

const collectionName = 'event_status'

const getEventStatusByUserId = (user_id, done) => {
  var event_status = DB.get().collection(collectionName)
  var query = {
    user_id: new ObjectID(user_id)
  }
  event_status.findOne(query, {}, (err, rest) => {
    // console.log(rest)
    done(rest)
  })
}

const updateEventStatus = (data, event_type, done) => {
  var event_status = DB.get().collection(collectionName)
  var query = {
    user_id: new ObjectID(data.user_id)
  }
  var update = {
    user_id: new ObjectID(data.user_id),
    event_type: event_type,
    att_time: new Date(data.att_time),
    area_type: data.area_type
  }
  event_status.findOneAndUpdate(query, update, {upsert: true, _new: false, _setDefaultsOnInsert: true}, (err, rest) => {
    done(rest)
  });
}

export default {
  updateEventStatus,
  getEventStatusByUserId
}