'use strict'

// package
import { Router } from 'express'
const router = new Router()
import Ajv from 'ajv'
const ajv = new Ajv()

import HttpStatus from './../helper/http_status.js'
import ConsultTopicModel from '../models/consultTopicModel.js'
import { Util, Enum } from '../helper'

router.route('/topics').get((req, res, next) => {

    var page = parseInt(req.query.page, 0)
    var limit = parseInt(req.query.limit, 0)
    var user_id = req.query.user_id

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    }

    if(!req.user.is_admin && req.user.user_id != user_id ){
        user_id = req.user.user_id
    }

    if(req.user.is_admin && !req.user.role.is_manage_consult){
        send.status = Enum.res_type.FAILURE;
        send.message = 'Permission denied';
        return res.json(send);
    }

    ConsultTopicModel.countTopic(user_id, (count_topic) => {
        if (count_topic instanceof Error) {
            send.status = Enum.res_type.FAILURE;
            send.message = 'Failed search an topics';
            return res.json(send);
        }

        ConsultTopicModel.getTopics(user_id, page*limit, limit, (topics) => {
            if (topics == null) {
                send.message = 'not found topics';
                return res.json(send);
            }else if(topics instanceof Error){
                send.message = 'error topic';
                return res.json(send);
            }
            send.status = Enum.res_type.SUCCESS;
            send.info = {topics: topics};
            send.pageinfo = {count: count_topic.count, page: page, limit: limit}
            return res.json(send)
        })
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
        return res.json({status: Enum.res_type.FAILURE, info:ajv.errors, message: 'bad request.'})

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    }

    ConsultTopicModel.addTopic(data, req.user.user_id, (result, error) => {
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
        return res.json({status: Enum.res_type.FAILURE, info:ajv.errors, message: 'bad request.'})

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    }

    ConsultTopicModel.getTopicsById(data.consult_id, (topics) => {
        if (topics == null) {
            send.message = 'not found topics';
            return res.json(send);
        } else if (topics instanceof Error) {
            send.message = 'error topic';
            console.log(topics)
            return res.json(send);
        }

        if (topics.user_id != req.user.user_id && !req.user.role.is_manage_consult) {
            send.status = Enum.res_type.FAILURE;
            send.message = 'Permission denied';
            return res.json(send);
        }

        ConsultTopicModel.deleteTopic(data.consult_id, req.user.user_id, (result, error) => {
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
    })
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

        if(topics.user_id != req.user.user_id && !req.user.role.is_manage_consult){
            send.status = Enum.res_type.FAILURE;
            send.message = 'Permission denied';
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
        return res.json({status: Enum.res_type.FAILURE, info:ajv.errors, message: 'bad request.'})

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    }

    ConsultTopicModel.getTopicsById(id, (topics) => {
        if (topics == null) {
            send.message = 'not found topics';
            return res.json(send);
        } else if (topics instanceof Error) {
            send.message = 'error topic';
            console.log(topics)
            return res.json(send);
        }

        if (topics.user_id != req.user.user_id && !req.user.role.is_manage_consult) {
            send.status = Enum.res_type.FAILURE;
            send.message = 'Permission denied';
            return res.json(send);
        }

        ConsultTopicModel.addMsg(id, data.message, req.user.user_id, req.user.is_admin, (result) => {
            if (result instanceof Error) {
                send.status = Enum.res_type.FAILURE;
                send.message = result
                return res.json(send);
            }

            var is_admin_reply = 0, is_admin_read = 0

            if (req.user.is_admin) {
                is_admin_reply = 1
                is_admin_read = 1
            } else {
                is_admin_reply = 0
                is_admin_read = 0
            }
            ConsultTopicModel.updateTopic(id, is_admin_read, is_admin_reply, (update_result) => {
                if (update_result instanceof Error) {
                    send.status = Enum.res_type.FAILURE;
                    send.info = update_result
                    return res.json(send);
                }

                send.status = Enum.res_type.SUCCESS
                send.info = result;
                return res.json(send)
            })
        });
    })
});

router.route('/topics/msg/:id').get((req, res, next) => {

    var id = req.params.id;

    var send = {
        status: Enum.res_type.FAILURE,
        info: {}
    }

    ConsultTopicModel.getTopicsById(id, (topic) => {
        if(topic instanceof Error){
            send.message = 'not found topic';
            return res.json(send);
        }

        if (topic.user_id != req.user.user_id && !req.user.role.is_manage_consult) {
            send.status = Enum.res_type.FAILURE;
            send.message = 'Permission denied';
            return res.json(send);
        }

        ConsultTopicModel.getMsgByTopic(id, (msg) => {
            if(msg instanceof Error){
                send.message = 'error msg';
                return res.json(send);
            }

            if(req.user.is_admin){
                ConsultTopicModel.updateTopicRead(id, (result) => {})
            }

            send.status = Enum.res_type.SUCCESS;
            send.info = {topic: topic, msg: msg};
            return res.json(send)
        })
    })
});

export default router
