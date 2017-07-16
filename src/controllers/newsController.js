'use strict'

// package
import { Router } from 'express'
const router = new Router()
import Ajv from 'ajv'
const ajv = new Ajv()

// using
import HttpStatus from './../helper/http_status.js'
import NewsModel from '../models/newsModel.js'
import { Util, Enum } from '../helper'
import FileModel from "../models/fileModel";

const fileUpload = require('express-fileupload')
router.use(fileUpload())

router.route('/').get((req, res, next) => {

    var page = parseInt(req.query.page, 0)
    var limit = parseInt(req.query.limit, 0)

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    };

    if(!req.user.is_admin){
        return HttpStatus.send(res, 'UNAUTHORIZED', {message: 'Not is admin.'})
    }

    NewsModel.countNews((count_news) => {
        if (count_news instanceof Error) {
            send.message = 'Error getting news';
            return res.json(send);
        }

        NewsModel.getNews(page*limit, limit, (news) => {
            if (news instanceof Error) {
                send.message = 'Error getting news';
                return res.json(send);
            }

            send.status = Enum.res_type.SUCCESS;
            send.info = news;
            send.pageinfo = {page:page, limit:limit, count:count_news.count}
            return res.json(send);

        });
    });
})

// router.route('/count').get((req, res, next) => {
//     var send = {
//         status: Enum.res_type.FAILURE,
//         info: {}
//     };
//
//     NewsModel.countNews((news) => {
//         if (news instanceof Error) {
//             send.message = 'Error getting news';
//             send.hint = news.sqlMessage;
//
//             return res.json(send);
//         }
//
//         send.status = Enum.res_type.SUCCESS;
//         send.info = news;
//
//         return res.json(send);
//
//     });
// })

router.route('/').post((req, res, next) => {
    var data = req.body
    var schema = {
        'additionalProperties': false,
        'properties': {
            'title': {
                'type': 'string'
            },
            'content': {
                'type': 'string'
            },
        },
        'required': [
            'title', 'content',
        ]
    }

    if(!req.user.is_admin){
        return HttpStatus.send(res, 'UNAUTHORIZED', {message: 'Not is admin.'})
    }

    var valid = ajv.validate(schema, data)
    if (!valid)
        return HttpStatus.send(res, 'BAD_REQUEST', { message: Util.toAjvResponse(ajv.errors) })

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    }

    NewsModel.addNews(data, req.user.user_id, (result) => {
        if (result instanceof Error) {
            send.status = Enum.res_type.FAILURE;
            send.info = result;
            return res.json(send);
        }

        send.status = Enum.res_type.SUCCESS
        send.info = result;
        return res.json(send)
    });
});

router.route('/:id').put((req, res, next) => {
    var id = req.params.id
    var data = req.body
    var schema = {
        'additionalProperties': false,
        'properties': {
            'title': {
                'type': 'string'
            },
            'content': {
                'type': 'string'
            },
        },
        'required': [
            'title', 'content',
        ]
    }
    var valid = ajv.validate(schema, data)
    if (!valid)
        return HttpStatus.send(res, 'BAD_REQUEST', { message: Util.toAjvResponse(ajv.errors) })

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    }

    if(!req.user.is_admin){
        return HttpStatus.send(res, 'UNAUTHORIZED', {message: 'Not is admin.'})
    }

    NewsModel.updateNews(id, data, req.user.user_id, (result) => {
        if (result instanceof Error) {
            send.status = Enum.res_type.FAILURE;
            send.info = result
            return res.json(send);
        }

        send.status = Enum.res_type.SUCCESS
        send.info = result;
        return res.json(send)
    });
});

router.route('/:id').delete((req, res, next) => {
    var id = req.params.id

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    }

    if(!req.user.is_admin){
        return HttpStatus.send(res, 'UNAUTHORIZED', {message: 'Not is admin.'})
    }

    NewsModel.deleteNews(id, req.user.user_id, (result) => {
        if (result instanceof Error) {
            send.status = Enum.res_type.FAILURE;
            send.message = result;
            return res.json(send);
        }

        send.status = Enum.res_type.SUCCESS
        send.info = result;
        return res.json(send)
    });
});

router.route('/:id/image').post((req, res, next) => {
    var id = req.params.id

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    }

    FileModel.saveFile(req.files.image, (result) => {
        if(result == null){
            send.status = Enum.res_type.FAILURE
            send.message = 'file not found'
            return res.json(send)
        }

        NewsModel.updateImage(id, result.fid, req.files.image.name, (result) => {
            if(result == null){
                send.status = Enum.res_type.FAILURE
                send.message = 'file not found'
                return res.json(send)
            }else if(result instanceof Error){
                send.status = Enum.res_type.FAILURE
                send.message = result
                return res.json(send)
            }
            send.status = 'success'
            send.info = result
            return res.json(send)
        })
    })
})

export default router
