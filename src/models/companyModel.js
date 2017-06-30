'use strict'


// import
import DB from '../db.js'
import { ObjectID } from 'mongodb'

const getCompanyById = (id, done) => {
  var company = DB.get().collection('company')
  var query = {
    _id: new ObjectID(id)
  }
  company.findOne(query, {}, (err, rest) => {
    done(rest)
  })
}

const getCompanyInArea = (location, radius, done) => {
  var company = DB.get().collection('company')
  var query = {
    location: {
      $near: {
        $geometry : {
          type : "Point" ,
          coordinates : [location.lng, location.lat]
        },
        $maxDistance : redius
      }
    }
  }
  company.findOne(query, (err, rest) => {
    done(rest)
  })
}

export default {
  getCompanyById,
  getCompanyInArea
}