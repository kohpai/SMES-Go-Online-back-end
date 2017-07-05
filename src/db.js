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

const reconnect = () => {
    console.log('Attempting to reconnect with MySQL server');
    connect(function(err) {
        if (err)
            setTimeout(reconnect, 5000);
    });
}

connection.on('error', function(err) {
    console.log('DB error with no pending callbacks, code: ', err.code);

    if (err.code === 'PROTOCOL_CONNECTION_LOST')
        reconnect();
    else
        process.exit(1);
});

export default {
    connect,
    get,
    close
}
