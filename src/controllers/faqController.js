'use strict'

// package
import { Router } from 'express'
const router = new Router()

// using
import HttpStatus from './../helper/http_status.js'
import FaqModel from '../models/faqModel.js'
import { Util, Enum } from '../helper'


/* further work
   - catch error
   */
router.route('/').get((req, res, next) => {
    // try {
    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    };

    FaqModel.getFaq((faq) => {
        if (faq instanceof Error) {
            send.message = 'Error getting faq';
            send.info = faq
            return res.json(send);
        }

        send.status = Enum.res_type.SUCCESS;
        send.info = faq;

        return res.json(send);

    });
})

export default router
