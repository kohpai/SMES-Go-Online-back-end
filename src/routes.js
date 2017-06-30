'use strict'

// import
import { Router } from 'express'

// using
import AuthController from './controllers/authController.js'
import EventLogsController from './controllers/eventLogsController.js'
import UsersController from './controllers/usersController.js'

// create router path
var router = new Router()

var api_v1_1 = '/api/v1.1'

router.use(api_v1_1, AuthController)
router.use(api_v1_1+'/events', EventLogsController)
router.use(api_v1_1+'/users', UsersController)

export default router