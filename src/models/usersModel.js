'use strict'


// import
import DB from '../db.js'
import { ObjectID } from 'mongodb'

const collectionName = 'users'

const getUserById = (id, done) => {
  var users = DB.get().collection(collectionName)
  var query = {
    _id: new ObjectID(id)
  }
  users.findOne(query, {}, (err, rest) => {
    done(rest)
  })
}

const getUserByUsernameAndPassword = (username, password, done) => {
  var users = DB.get().collection(collectionName)
  var query = {
    username,
    password
  }
  users.findOne(query, {}, (err, rest) => {
    done(rest)
  })
}

export default {
  getUserByUsernameAndPassword,
  getUserById
}