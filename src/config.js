'use strict'

const server = {
  host: process.env.HOST || 'localhost',
  port: process.env.HOST_PORT || 8000
}

const mongodb = {
  url : process.env.DB_URL || 'mongodb://localhost:27017/ez-att',
  options: {
    poolSize: 5,
    reconnectTries: 3600,
    reconnectInterval: 1000
  }
}

const ajv = {
  additionalProperties : false,

}

export default {
  server,
  mongodb,
  ajv
}