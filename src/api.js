'use strict'

// import
import Express from 'express'
// import Logger from 'winston'
import Config from './config.js'

// express middleware
import BodyParser from 'body-parser'
import Routes from './routes.js'

// app setup
var app = Express()

// setting
app.set('port', Config.server.port)

// use middleware
app.use(BodyParser.urlencoded({ extended: false }))
app.use(BodyParser.json())

// use routes middleware
app.use(Routes)

// app.use(function(req, res, next) {
//   var err = new Error('Not Found')
//   err.status = 404
//   next(err)
// })

// start server if without http
// server.listen(Config.server.port, () => {
//   console.log('Server listening on port ' + Config.server.port)
// })


export default app