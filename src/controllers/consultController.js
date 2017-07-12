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

    ConsultTopicModel.getTopics(req.user.ent.enterprise_id, (topics) => {
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

    ConsultTopicModel.addTopic(data, req.user.ent.enterprise_id, (result, error) => {
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
                'type': 'number'
            }
        },
        "required": [ "consult_id" ]
    };

    var valid = ajv.validate(schema, data)
    if (!valid)
        return HttpStatus.send(res, 'BAD_REQUEST', { message: Util.toAjvResponse(ajv.errors) })

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    }
    ConsultTopicModel.deleteTopic(data.consult_id, req.user.ent.enterprise_id, (result, error) => {
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
    var id = req.params.id
    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    }

    ConsultTopicModel.getTopicsById(id, (topics) => {
        if (topics == null) {
            send.message = 'not found topics';
            return res.json(send);
        }else if(topics instanceof Error){
            send.message = 'error topic';
            console.log(topics)
            return res.json(send);
        }
        send.status = Enum.res_type.SUCCESS;
        send.info = {topics: topics};
        return res.json(send)
    })

});

router.route('/topics/msg/:id').post((req, res, next) => {
    var id = req.params.id
    id = parseInt(id)
    var data = req.body;
    var schema = {
        'properties': {
            'message': {
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

    ConsultTopicModel.addMsg(id, data.message, req.user.user_id, req.user.is_admin, req.user.ent.enterprise_id, (result) => {
        if (result instanceof Error) {
            send.status = Enum.res_type.FAILURE;
            send.message = result
            return res.json(send);
        }

        var is_admin_reply = 0, is_admin_read = 0

        if(req.user.is_admin){
            is_admin_reply = 1
            is_admin_read = 1
        }else{
            is_admin_reply = 0
            is_admin_read = 0
        }
        ConsultTopicModel.updateTopic(id, is_admin_read, is_admin_reply, (update_result) => {
            if(update_result instanceof Error){
                send.status = Enum.res_type.FAILURE;
                send.info = update_result
                return res.json(send);
            }

            send.status = Enum.res_type.SUCCESS
            send.info = result;
            return res.json(send)
        })
    });

});

router.route('/topics/msg/:id').get((req, res, next) => {

    var id = req.params.id;

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    }

    ConsultTopicModel.getMsgByTopic(id, (msg) => {
        if (msg == null) {
            send.message = 'not found msg';
            return res.json(send);
        }else if(msg instanceof Error){
            send.message = 'error msg';
            return res.json(send);
        }

        if(req.user.is_admin){
            ConsultTopicModel.updateTopicRead(id, (result) => {})
        }

        send.status = Enum.res_type.SUCCESS;
        send.info = {msg: msg};
        return res.json(send)
    })

});

export default router
