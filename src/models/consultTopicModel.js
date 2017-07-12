'use strict'


// import
import DB from '../db.js'

const timeout = 20000;

const getTopics = (done) => {
    var queryOption = {
        sql: 'SELECT * FROM `consult_topic`;',
        timeout: timeout, // 40s
    };

    DB.get().query(queryOption, function(error, results, fields) {
        if (error) {
            return done(error);
        } else {
            return done(results);
        }
    });
}

const addTopic = (input, done) => {

    var topicInfo = {
        topic: input.topic,
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

const deleteTopic = (id, done) => {

    var queryOption = {
        sql: 'DELETE FROM consult_topic WHERE consult_id = ?',
        timeout: timeout, // 20s
        values: [id],
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
        sql: 'SELECT * FROM `consult_msg` WHERE `ent_id` = ?;',
        timeout: timeout, // 40s
        values: [id]
    };

    DB.get().query(queryOption, function(error, results, fields) {
        if (error) {
            return done(error);
        } else if (results.length) {
            return done(results);
        }

        return done(null);
    });
}

export default {
    getTopics,
    getMsgByTopic,
    addTopic,
    deleteTopic
}
