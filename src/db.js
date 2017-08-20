'use strict'

// import
var MySql = require('mysql');

// using
import Config from './config.js'

var connection
var connection_product

const connect = (done) =>  {

    connection = MySql.createConnection(Config.mysql);

    connection.connect(function(err) {
        if (err) {
            console.log('Connect to MySQL server failed: ', err);
            return done(err);

        } else {
            console.log('Connect to MySQL server successful');
            return done();
        }
    });

    connection.on('error', function(err) {
        console.log('DB error with no pending callbacks, code: ', err.code);

        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            connection = null;
            reconnect();
        }
    });
}

const connect_product = (done) =>  {

    connection_product = MySql.createConnection(Config.mysql_product)

    connection_product.connect(function(err) {
        if (err) {
            console.log('Connect to MySQL server failed: ', err);
            return done(err);
        } else {
            console.log('Connect to MySQL server successful');
            return done();
        }
    });

    connection_product.on('error', function(err) {
        console.log('DB error with no pending callbacks, code: ', err.code);

        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            connection_product = null;
            reconnect_product();
        }
    });

}

const get = () => {
    return connection
}

const get_product = () => {
    return connection_product
}

const close = (done) => {
    if (connection_product) {
        connection.end(function(err) {
            if (err) {
                console.log('db.js: Attemtion to terminate connection with MySQL server failed: ', err);
                return done(err);
            } else {
                console.log('db.js: Attemtion to terminate connection with MySQL server successful');
                connection = null;
                return done();
            }
        });
    } else {
        return done();
    }
}

const close_product = (done) => {
    if (connection_product) {
        connection_product.end(function(err) {
            if (err) {
                console.log('db.js: Attemtion to terminate connection with MySQL server failed: ', err);
                return done(err);
            } else {
                console.log('db.js: Attemtion to terminate connection with MySQL server successful');
                connection_product = null;
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

const reconnect_product = () => {
    console.log('Attempting to reconnect with MySQL server');

    connect_product(function(err) {
        if (err)
            setTimeout(reconnect, 5000);
    });
}

const check_connect = (err) => {
    if (err) {
        connect((err) => {})
    }
}

const check_connect_product = (err) => {
    if (err) {
        connect_product((err) => {})
    }
}


export default {
    connect,
    get,
    close,
    connect_product,
    get_product,
    close_product,
    check_connect,
    check_connect_product
}
