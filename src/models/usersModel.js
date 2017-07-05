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
        sql: 'SELECT * FROM `entrepreneur` WHERE `ent_id` = ?;' +
        'SELECT * FROM `ent_ecom_needed_help` WHERE `ent_id` = ?;' +
        'SELECT * FROM `ent_intended_sme_proj` WHERE `ent_id` = ?;' +
        'SELECT * FROM `ent_participated_sme_proj` WHERE `ent_id` = ?;',
        timeout: timeout, // 20s
        // values: [tableEnt, DB.get().escape(id)],
        values: [id, id, id, id],
    };

    DB.get().query(queryOption, function(error, results, fields) {
        if (error) {
            console.log('error');
            return done(error);
        } else {
            var user = results[0][0];
            var helps = results[1];
            var intProjs = results[2];
            var partProjs = results[3];

            user.needed_help = mergeMultivalued(helps, 'needed_help');
            user.intended_sme_proj = mergeMultivalued(intProjs, 'intended_sme_proj');
            user.participated_sme_proj = mergeMultivalued(partProjs, 'participated_sme_proj');

            return done(user);

        }
    });
}

const addUser = (input, done) => {
    var hashids = new Hashids(input.phone_no);
    var userInfo = {
        user_id: hashids.encode(1, 2, 3, 4, 5),
        username: input.phone_no,
        password: hashids.encode(6, 7, 8),
        first_name: input.first_name,
        last_name: input.last_name,
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
            input = Object.assign(input, input.enterprise_type);
            input = Object.assign(input, input.needed_help);
            input.user_id = results.insertId;

            delete input.first_name;
            delete input.last_name;
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
}
