'use strict'

// import
import { Router } from 'express'

// using
import AuthController from './controllers/authController.js'
import UsersController from './controllers/usersController.js'
import ProductsController from './controllers/productsController.js'
import NewsController from './controllers/newsController.js'
import CountryController from './controllers/countryController.js'

// create router path
var router = new Router();

var api_version = '/api/dev';

router.use(api_version, AuthController);
router.use(api_version+'/users', UsersController);
router.use(api_version+'/news', NewsController);
router.use(api_version+'/country', CountryController);
router.use(api_version+'/products', ProductsController);

export default router;
