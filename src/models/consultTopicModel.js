'use strict'


// import
import DB from '../db.js'

const timeout = 20000;

const getTopics = (user_id, offset, limit, done) => {
    var queryOption = {
        sql: 'SELECT * FROM `consult_topic` WHERE `user_id` = ? LIMIT ? OFFSET ?;',
        timeout: timeout, // 40s
        values: [user_id, limit, offset],
    };

    DB.get().query(queryOption, function(error, results, fields) {
        if (error) {
            return done(error);
        } else {
            return done(results);
        }
    });
}

const countTopic = (user_id, done) => {
    var queryOption = {
        sql: 'SELECT COUNT(*) AS count FROM `consult_topic` WHERE `user_id` = ?;',
        timeout: timeout, // 40s
        values: [user_id],
    };

    DB.get().query(queryOption, function(error, results, fields) {
        if (error) {
            return done(error);
        } else if(results.length){
            return done(results[0]);
        }else{
            return done(results);
        }
    });
}

const getTopicsById = (id, done) => {
    var queryOption = {
        sql: 'SELECT * FROM `consult_topic` WHERE `consult_id` = ?;',
        timeout: timeout, // 40s
        values: [id],
    };

    DB.get().query(queryOption, function(error, results, fields) {
        if(error){
            return done(error);
        }else if(results.length) {
            return done(results[0]);
        }
        return done(results);
    });
}


const addTopic = (input, user_id, done) => {

    var topicInfo = {
        topic: input.topic,
        user_id: user_id,
        update_datetime: new Date(),
    };
    var queryOption = {
        sql: 'INSERT INTO consult_topic SET ?',
        timeout: timeout, // 20s
        values: [topicInfo],
    };

    DB.get().query(queryOption, function(error, results, fields) {
        if (error) {
            return done(error);
        } else {
            return done(results);
        }
    });
}

const deleteTopic = (id, user_id, done) => {

    var queryOption = {
        sql: 'DELETE FROM consult_topic WHERE user_id = ? AND consult_id = ?',
        timeout: timeout, // 20s
        values: [user_id, id],
    };

    DB.get().query(queryOption, function(error, results, fields) {
        if (error) {
            return done(error);
        } else {
            return done(results);
        }
    });
}

const getMsgByTopic = (id, done) => {
    var queryOption = {
        sql: 'SELECT * FROM `consult_msg` WHERE `topic_id` = ?;',
        timeout: timeout, // 40s
        values: [id]
    };

    DB.get().query(queryOption, function(error, results, fields) {
        if (error) {
            return done(error);
        } else if (results.length) {
            return done(results);
        }

        return done([]);
    });
}

const addMsg = (id, message, user_id, is_admin ,ent_id, done) => {

    var topicInfo = {
        topic_id: id,
        user_id: user_id,
        is_admin: is_admin,
        ent_id: ent_id,
        sent_time: new Date(),
        text: message,
    };
    var queryOption = {
        sql: 'INSERT INTO consult_msg SET ?',
        timeout: timeout, // 20s
        values: [topicInfo],
    };

    DB.get().query(queryOption, function(error, results, fields) {
        if (error) {
            return done(error);
        } else {
            return done(results);
        }
    });
}

const updateTopic = (id, is_admin_read, is_admin_reply, done) => {
    var queryOption = {
        sql: 'UPDATE consult_topic SET is_admin_reply = ?, is_admin_read = ?, update_datetime = ?, count_msg = count_msg + 1 WHERE consult_id = ?',
        timeout: timeout, // 20s
        values: [is_admin_reply, is_admin_read, new Date(), id],
    };

    DB.get().query(queryOption, function(error, results, fields) {
        if (error) {
            return done(error);
        } else {
            return done(results);
        }
    });
}

const updateTopicRead = (id, done) => {
    var queryOption = {
        sql: 'UPDATE consult_topic SET is_admin_read = 1, update_datetime = ? WHERE consult_id = ?',
        timeout: timeout, // 20s
        values: [new Date(), id],
    };

    DB.get().query(queryOption, function(error, results, fields) {
        if (error) {
            return done(error);
        } else {
            return done(results);
        }
    });
}

export default {
    getTopicsById,
    countTopic,
    getTopics,
    getMsgByTopic,
    addTopic,
    deleteTopic,
    addMsg,
    updateTopic,
    updateTopicRead,
}
