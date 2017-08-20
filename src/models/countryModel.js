'use strict'


// import
import DB from '../db.js';
import Hashids from 'hashids';

const timeout = 20000;

const getProvinces = (done) => {
    var queryOption = {
        sql: 'SELECT * FROM `addr_province`;',
        timeout: timeout, // 20s
    };

    DB.get().query(queryOption, function(error, results, fields) {
        if (error) {
            DB.check_connect(error)
            return done(error);
        } else if (results.length) {
            return done(results);
        }

        return done(null);
    });
}

const getAmphoes = (id, done) => {
    var queryOption = {
        sql: 'SELECT * FROM `addr_amphoe` WHERE `province_code` = ?;',
        timeout: timeout, // 20s
        values: [id],
    };

    DB.get().query(queryOption, function(error, results, fields) {
        if (error) {
            DB.check_connect(error)
            return done(error);
        } else if (results.length) {
            return done(results);
        }

        return done(null);
    });
}

const getTambons = (id, done) => {
    var queryOption = {
        sql: 'SELECT * FROM `addr_tambon` WHERE `amphoe_code` = ?;',
        timeout: timeout, // 20s
        values: [id],
    };

    DB.get().query(queryOption, function(error, results, fields) {
        if (error) {
            DB.check_connect(error)
            return done(error);
        } else if (results.length) {
            return done(results);
        }

        return done(null);
    });
}

export default {
    getProvinces,
    getAmphoes,
    getTambons,
}
