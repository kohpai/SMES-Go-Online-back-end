#!/usr/bin/env node
'use strict'

// import
import Http from 'http'

// using
import Config from './config.js'
import Api from './api.js'
import Mongodb from './db.js'

// server setup
var server = Http.createServer(Api)

Mongodb.connect((err) => {
  if(!err) server.listen(Config.server.port)
})

// on server start
server.on('listening', () => {
  var addr = server.address()
  var bind = typeof addr === 'string'
    ? 'Pipe ' + addr
    : 'Port ' + addr.port
  console.log('Server listening on port ' + bind)
})

// on server error
server.on('error', (err) => {
  var addr = server.address()
  if (err.syscall !== 'listen') {
    throw err
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + addr
    : 'Port ' + addr.port

  switch (err.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges')
      process.exit(1)
      break
    case 'EADDRINUSE':
      console.error(bind + ' is already in use')
      process.exit(1)
      break
    default:
      throw err
  }
})