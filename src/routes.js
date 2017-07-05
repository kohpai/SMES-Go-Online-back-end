'use strict'

// import
import { Router } from 'express'

// using
import AuthController from './controllers/authController.js'
import UsersController from './controllers/usersController.js'
import NewsController from './controllers/newsController.js'

// create router path
var router = new Router();

var api_version = '/api/dev';

router.use(api_version, AuthController);
router.use(api_version+'/users', UsersController);
router.use(api_version+'/news', NewsController);

export default router;
