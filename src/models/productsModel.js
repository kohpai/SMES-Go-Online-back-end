'use strict'


// import
import DB from '../db.js';
import Hashids from 'hashids';
import EnterpriseModel from './enterpriseModel.js';

const timeout = 20000;

const addProduct = (input, done) => {
    var hashids = new Hashids(input.sku);
    var productInfo = {
        title: input.title,
        sku: input.sku,
        unspsc: input.unspsc,
        category: input.category,
        no_of_pieces: input.no_of_pieces,
        price: input.price,
        barcode: input.barcode,
        description: input.description,
    };
    var queryOption = {
        sql: 'INSERT INTO product SET ?',
        timeout: timeout, // 20s
        values: [productInfo],
    };

    DB.get().query(queryOption, function(error, results, fields) {
        if (error) {
            return done(error);
        } else {
            return done(results);
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
    addProduct,
}
