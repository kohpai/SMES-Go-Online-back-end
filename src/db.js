'use strict'

// import
var MySql = require('mysql');

// using
import Config from './config.js'

var state = {
    db: null,
}

const connection = MySql.createConnection(Config.mysql);

const connect = (done) =>  {
    if (state.db)
        return done()

    connection.connect(function(err) {
        if (err) {
            console.log('db.js: Attemtion to connect with MySQL server failed: ', err);
            return done(err);
        } else {
            console.log('db.js: Attemtion to connect with MySQL server successful');
            state.db = connection;
            return done();
        }
    });
}

const get = () => {
    return state.db
}

const close = (done) => {
    if (state.db) {
        connection.end(function(err) {
            if (err) {
                console.log('db.js: Attemtion to terminate connection with MySQL server failed: ', err);
                return done(err);
            } else {
                console.log('db.js: Attemtion to terminate connection with MySQL server successful');
                state.db = null;
                return done();
            }
        });
    } else {
        return done();
    }
}

export default {
    connect,
    get,
    close
}
