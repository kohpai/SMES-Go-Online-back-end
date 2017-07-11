'use strict'

// package
import { Router } from 'express'
const router = new Router()
import Ajv from 'ajv'
const ajv = new Ajv()

// using
import HttpStatus from './../helper/http_status.js'
import ConsultTopicModel from '../models/consultTopicModel.js'
import { Util, Enum } from '../helper'


/* further work
   - catch error
   */
router.route('/topics').get((req, res, next) => {

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    }

    ConsultTopicModel.getTopics((topics) => {
        if (topics == null) {
            send.message = 'not found topics';
            return res.json(send);
        }else if(topics instanceof Error){
            send.message = 'error topic';
            return res.json(send);
        }
        send.status = Enum.res_type.SUCCESS;
        send.info = {topics: topics};
        return res.json(send)
    })

});

router.route('/topics').post((req, res, next) => {

    var data = req.body;
    var schema = {
        'properties': {
            'topic': {
                'type': 'string'
            }
        }
    };

    var valid = ajv.validate(schema, data)
    if (!valid)
        return HttpStatus.send(res, 'BAD_REQUEST', { message: Util.toAjvResponse(ajv.errors) })

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    }

    ConsultTopicModel.addTopic(data, (result, error) => {
        if (error) {
            send.status = Enum.res_type.FAILURE;

            send.message = result
            send.info = error

            return res.json(send);
        }

        send.status = Enum.res_type.SUCCESS
        send.info = result;
        return res.json(send)
    });

});

router.route('/topics').delete((req, res, next) => {

    var data = req.body
    var schema = {
        'properties': {
            'consult_id': {
                'type': 'string'
            }
        }
    };

    var valid = ajv.validate(schema, data)
    if (!valid)
        return HttpStatus.send(res, 'BAD_REQUEST', { message: Util.toAjvResponse(ajv.errors) })

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    }

    ConsultTopicModel.deleteTopic(data.consult_id, (result, error) => {
        if (error) {
            send.status = Enum.res_type.FAILURE;

            send.message = result
            send.info = error

            return res.json(send);
        }

        send.status = Enum.res_type.SUCCESS
        send.info = result;
        return res.json(send)
    });

});




router.route('/topics/:id').get((req, res, next) => {

    var data = {topic_id: req.params.id};

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    }

    ConsultTopicModel.getMsgByTopic(data.topic_id, (msg) => {
        if (msg == null) {
            send.message = 'not found msg';
            return res.json(send);
        }else if(msg instanceof Error){
            send.message = 'error msg';
            return res.json(send);
        }
        send.status = Enum.res_type.SUCCESS;
        send.info = {msg: msg};
        return res.json(send)
    })

});

export default router
