'use strict'


// import
import DB from '../db.js';
import Hashids from 'hashids';

const timeout = 20000;

const mergeMultivalued = (array, key) => {
    var output = [];

    array.forEach(function(value) {
        output.push(value[key]);
    });

    return output;
}

const getUserById = (id, done) => {
    var queryOption = {
        sql: 'SELECT * FROM `user` WHERE `user_id` = ?;',
        timeout: timeout, // 20s
        values: [id],
    };

    DB.get().query(queryOption, function(error, results, fields) {
        if (error) {
            return done(error);
        } else if (results.length) {
            delete results[0].password;
            return done(results[0]);
        }

        return done(null);
    });
}

const getEnterpriseByUserId = (id, done) => {
    var queryOption = {
        sql: 'SELECT * FROM `enterprise` WHERE `user_id` = ?;',
        timeout: timeout, // 20s
        values: [id],
    };

    DB.get().query(queryOption, function(error, results, fields) {
        if (error)
            return done(error);
        else if (results.length)
            return done(results[0]);

        return done(null);
    });
}

const addUser = (input, done) => {
    var hashids = new Hashids(input.phone_no);
    var userInfo = {
        user_id: hashids.encode(1, 2, 3, 4, 5),
        username: input.phone_no,
        password: hashids.encode(6, 7, 8),
        full_name: input.full_name,
        role: 'user'
    };
    var queryOption = {
        sql: 'INSERT INTO user SET ?',
        timeout: timeout, // 20s
        values: [userInfo],
    };

    DB.get().query(queryOption, function(error, results, fields) {
        if (error) {
            return done(error);
        } else {
            Object.keys(input.enterprise_type).forEach(function(value) {
                input['is_' + value] = true;
            });

            input = Object.assign(input, input.enterprise_type);
            input = Object.assign(input, input.needed_help);
            input.user_id = userInfo.user_id;

            delete input.full_name;
            delete input.phone_no;
            delete input.enterprise_type;
            delete input.needed_help;

            queryOption.sql = 'INSERT INTO enterprise SET ?';
            queryOption.values = [input];

            DB.get().query(queryOption, function(error, results, fields) {
                if (error)
                    return done(error);
                else
                    return done(results.insertId);
            });
        }
    });
}

const authenUser = (username, password, done) => {
    var queryOption = {
        sql: 'SELECT `user_id` FROM `user` WHERE `username` = ? AND `password` = ?',
        timeout: timeout, // 20s
        values: [username, password],
    };

    DB.get().query(queryOption, function(error, results, fields) {
        if (error) {
            return done(error);
        } else if (results.length) {
            results[0].id = results[0].user_id;
            delete results[0].user_id;
            return done(results[0]);
        } else {
            return done(results);
        }
    });
}

export default {
    authenUser,
    addUser,
    getUserById,
    getEnterpriseByUserId,
}
