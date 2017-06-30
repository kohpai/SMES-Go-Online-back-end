'use strict'

// import
import { Router } from 'express'

// using
import AuthController from './controllers/authController.js'
import UsersController from './controllers/usersController.js'

// create router path
var router = new Router()

var api_version = '/api/v0.1'

router.use(api_version, AuthController)
router.use(api_version+'/users', UsersController)

export default router
