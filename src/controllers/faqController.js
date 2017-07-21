'use strict'

// package
import { Router } from 'express'
import Ajv from 'ajv'
const router = new Router()
const ajv = new Ajv()

import HttpStatus from './../helper/http_status.js'
import FaqModel from '../models/faqModel.js'
import { Util, Enum } from '../helper'


router.route('/').get((req, res, next) => {
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

router.route('/').post((req, res, next) => {
    var data = req.body
    var schema = {
        'additionalProperties': false,
        'properties': {
            'question': {
                'type': 'string'
            },
            'answer': {
                'type': 'string'
            },
        },
        'required': [
            'question', 'answer',
        ]
    }

    if(!req.user.is_admin){
        return res.json({status: Enum.res_type.FAILURE, info:{}, message: 'Not is admin.'})
    }

    var valid = ajv.validate(schema, data)
    if (!valid)
        return res.json({status: Enum.res_type.FAILURE, info:ajv.errors, message: 'bad request.'})

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    }

    FaqModel.addFaq(data, req.user.user_id, (result) => {
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

router.route('/:id').get((req, res, next) => {
    var id = req.params.id

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    }

    FaqModel.detailFaq(id, (result) => {
        if (result instanceof Error) {
            send.status = Enum.res_type.FAILURE;
            send.message = 'faq not found.'
            send.info = result
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
            'question': {
                'type': 'string'
            },
            'answer': {
                'type': 'string'
            },
        },
        'required': [
            'question', 'answer',
        ]
    }

    if(!req.user.is_admin){
        return res.json({status: Enum.res_type.FAILURE, info:{}, message: 'Not is admin.'})
    }

    var valid = ajv.validate(schema, data)
    if (!valid)
        return res.json({status: Enum.res_type.FAILURE, info:ajv.errors, message: 'bad request.'})

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    }

    FaqModel.updateFaq(id, data, req.user.user_id, (result) => {
        if (result instanceof Error) {
            send.status = Enum.res_type.FAILURE;
            send.message = 'faq not found.'
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
        return res.json({status: Enum.res_type.FAILURE, info:{}, message: 'Not is admin.'})
    }

    FaqModel.deleteFaq(id, req.user.user_id, (result) => {
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


export default router
