'use strict'

import DB from '../db.js';

const timeout = 20000;

const addContact = (input, done) => {
    var queryOption = {
        sql: 'INSERT INTO contact SET ?',
        timeout: timeout, // 20s
        values: [input],
    };

    DB.get().query(queryOption, function(error, results, fields) {
        if (error)
            return done(error);
        else
            return done(results.insertId);
    });
}

const addEnterprise = (input, done) => {
    var queryOption = {
        sql: 'INSERT INTO enterprise SET ?',
        timeout: timeout, // 20s
        values: [input],
    };

    DB.get().query(queryOption, function(error, results, fields) {
        if (error)
            return done(error);
        else
            return done(results.insertId);
    });
}

const updateEnterprise = (id, input, done) => {
    var queryOption = {
        sql: 'UPDATE enterprise SET ? WHERE user_id = ?',
        timeout: timeout, // 20s
        values: [input, id],
    };

    DB.get().query(queryOption, function(error, results, fields) {
        if (error)
            return done(error);
        else
            return done(results);
    });
}

export default {
    addContact,
    addEnterprise,
    updateEnterprise
}
