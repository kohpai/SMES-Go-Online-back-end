'use strict'

// package
import { Router } from 'express'
const router = new Router()

// using
import HttpStatus from './../helper/http_status.js'
import NewsModel from '../models/newsModel.js'
import { Util, Enum } from '../helper'


/* further work
   - catch error
   */
router.route('/').post((req, res, next) => {
    // try {
    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    }

    NewsModel.getNews((news) => {
        if (news instanceof Error) {
            send.message = 'Error getting news';
            send.hint = news.sqlMessage;

            return res.json(send);
        }

        send.status = Enum.res_type.SUCCESS;
        send.info = news;

        return res.json(send);

    });
})

export default router
