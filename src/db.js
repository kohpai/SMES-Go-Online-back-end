'use strict'

// import
var MySql = require('mysql');

// using
import Config from './config.js'

var state = {
    db: null,
    db_product: null,
}

var connection = MySql.createConnection(Config.mysql);
var connection_product = MySql.createConnection(Config.mysql_product);

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

const connect_product = (done) =>  {
    if (state.db_product)
        return done()

    connection_product.connect(function(err) {
        if (err) {
            console.log('db.js: Attemtion to connect with MySQL server failed: ', err);
            return done(err);
        } else {
            console.log('db.js: Attemtion to connect with MySQL server successful');
            state.db_product = connection_product;
            return done();
        }
    });
}

const get = () => {
    return state.db
}

const get_product = () => {
    return state.db_product
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

const close_product = (done) => {
    if (state.db_product) {
        connection_product.end(function(err) {
            if (err) {
                console.log('db.js: Attemtion to terminate connection with MySQL server failed: ', err);
                return done(err);
            } else {
                console.log('db.js: Attemtion to terminate connection with MySQL server successful');
                state.db_product = null;
                return done();
            }
        });
    } else {
        return done();
    }
}

const reconnect = () => {
    console.log('Attempting to reconnect with MySQL server');
    connection = MySql.createConnection(Config.mysql);

    connect(function(err) {
        if (err)
            setTimeout(reconnect, 5000);
    });
}

const reconnect_product = () => {
    console.log('Attempting to reconnect with MySQL server');
    connection_product = MySql.createConnection(Config.mysql_product);

    connect_product(function(err) {
        if (err)
            setTimeout(reconnect, 5000);
    });
}

connection.on('error', function(err) {
    console.log('DB error with no pending callbacks, code: ', err.code);

    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        state.db = null;
        reconnect();
    } else {
        process.exit(1);
    }
});

connection_product.on('error', function(err) {
    console.log('DB error with no pending callbacks, code: ', err.code);

    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        state.db_product = null;
        reconnect_product();
    } else {
        process.exit(1);
    }
});

export default {
    connect,
    get,
    close,
    connect_product,
    get_product,
    close_product
}
