'use strict'


// import
import DB from '../db.js'

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
        timeout: timeout, // 40s
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

const addUser = (userInfo, done) => {
    var queryOption = {
        sql: 'INSERT INTO entrepreneur (' +
        'sme_id, first_name, last_name, citizen_id,' +
        'phone_no, email, job, ecom_do_own, ecom_category,' +
        'know_estda, house_no, village_no, alley, village_title,' +
        'road, province, district, subdistrict, postal_code, scholar)' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);',
        timeout: timeout, // 40s
        // values: [tableEnt, DB.get().escape(id)],
        values: [
            userInfo.sme_id, userInfo.first_name, userInfo.last_name,
            userInfo.citizen_id, userInfo.phone_no, userInfo.email,
            userInfo.job, userInfo.ecom_do_own, userInfo.ecom_category,
            userInfo.know_estda, userInfo.house_no, userInfo.village_no,
            userInfo.alley, userInfo.village_title, userInfo.road,
            userInfo.province, userInfo.district, userInfo.subdistrict,
            userInfo.postal_code, userInfo.scholar
        ],
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

const getAdminById = (id, done) => {
    var queryOption = {
        sql: 'SELECT * FROM `administrator` WHERE `admin_id` = ?',
        timeout: timeout, // 40s
        // values: [tableEnt, DB.get().escape(id)],
        values: [id],
    };

    DB.get().query(queryOption, function(error, results, fields) {
        if (error)
            return done(error);
        else
            return done(results[0]);
    });
}

const getUserByUsernameAndPassword = (username, password, done) => {
    var queryOption = {
        sql: 'SELECT * FROM `account` WHERE `username` = ? AND `password` = ?',
        timeout: timeout, // 40s
        values: [username, password],
    };

    DB.get().query(queryOption, function(error, results, fields) {
        console.log('getUserByUsernameAndPassword results: ', results);
        if (error) {
            return done(error);
        } else if (results[0]) {
            if (results[0].role === 'user') {
                getUserById(results[0].user_id, function(results) {
                    return done(results);
                });
            } else {
                getAdminById(results[0].user_id, function(results) {
                    return done(results);
                });
            }
        } else {
            return done(results);
        }
    });
}

export default {
    getUserByUsernameAndPassword,
    getUserById,
    addUser,
}
