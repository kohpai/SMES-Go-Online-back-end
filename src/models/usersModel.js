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
    var userInfo = {username: hashids.encode(1)};
    var queryOption = {
        // sql: 'INSERT INTO entrepreneur (' +
        //         'registration_type, enterprise_name, name, id_no, house_no, village_no,' +
        //         'alley, village_title, road, subdistrict, district, province,' +
        //         'postal_code, phone_no, enterprise_type, needed_help) ' +
        //      'VALUES (' +
        //         '?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        sql: 'INSERT INTO enterprise SET ?',
        timeout: timeout, // 20s
        // values: [tableEnt, DB.get().escape(id)],
        values: [],
    };

    DB.get().query(queryOption, function(error, results, fields) {
        console.log('inserted: ', results.insertId);
        if (error) {
            return done(error);
        } else {
            var tmp = [[], [], []];

            userInfo.needed_help.forEach(function(value) {
                tmp[0].push([results.insertId, value]);
            });
            userInfo.intended_sme_proj.forEach(function(value) {
                tmp[1].push([results.insertId, value]);
            });
            userInfo.participated_sme_proj.forEach(function(value) {
                tmp[1].push([results.insertId, value]);
            });

            queryOption.sql = '';
            queryOption.sql += (tmp[0].length ?
                'INSERT INTO `ent_ecom_needed_help` (ent_id, needed_help) VALUES ?;' :
                '');
            queryOption.sql += (tmp[1].length ?
                'INSERT INTO `ent_intended_sme_proj` (ent_id, intended_sme_proj) VALUES ?;' :
                '');
            queryOption.sql += (tmp[2].length ?
                'INSERT INTO `ent_participated_sme_proj` (ent_id, participated_sme_proj) VALUES ?;' :
                '');
            queryOption.values = [tmp[0], tmp[1], tmp[2]];

            console.log('userInfo: ', queryOption.values);

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
    authenUser
}
