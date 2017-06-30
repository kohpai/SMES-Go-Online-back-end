'use strict'

// import
import { MongoClient } from 'mongodb'

// using
import Config from './config.js'

var state = {
  db: null,
}

const connect = (done) =>  {
  if (state.db) return done()

  MongoClient.connect(Config.mongodb.url, Config.mongodb.options,(err, db) => {
    if (err) {
      console.log("Mongodb can't connect to "+Config.mongodb.url)
      return done(err)
    }
    state.db = db
    console.log('MongoDb Conected on', Config.mongodb.url)
    done()
  })
}

const get = () => {
  return state.db
}

const close = (done) => {
  if (state.db) {
    state.db.close((err, result) => {
      state.db = null
      state.mode = null
      done(err)
    })
  }
}

export default {
  connect,
  get,
  close
}