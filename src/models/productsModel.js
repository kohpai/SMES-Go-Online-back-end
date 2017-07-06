'use strict'


// import
import DB from '../db.js';
import Hashids from 'hashids';
import EnterpriseModel from './enterpriseModel.js';

const timeout = 20000;

const addProduct = (input, done) => {
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

const updateProduct = (id, input, done) => {
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
        sql: 'UPDATE product SET ? WHERE prod_id = ?',
        timeout: timeout, // 20s
        values: [productInfo, id],
    };

    DB.get().query(queryOption, function(error, results, fields) {
        if (error) {
            return done(error);
        } else {
            return done(results);
        }
    });
}

const detailProduct = (id, done) => {
    var queryOption = {
        sql: 'SELECT * FROM product WHERE prod_id = ?',
        timeout: timeout, // 20s
        values: [id],
    };

    DB.get().query(queryOption, function(error, results, fields) {
        if (error) {
            return done(error);
        } else if(results.length) {
            return done(results[0]);
        }
        return done(null);
    });
}

const getImages = (id, done) => {
    var queryOption = {
        sql: 'SELECT * FROM prod_image WHERE prod_id = ? AND status = 1',
        timeout: timeout, // 20s
        values: [id],
    };

    console.log(queryOption)
    console.log(id)

    DB.get().query(queryOption, function(error, results, fields) {
        if (error) {
            return done(error);
        }

        return done(results);
    });
}

const deleteProduct = (id, done) => {
    var productInfo = {
        status: 0
    };
    var queryOption = {
        sql: 'UPDATE product SET ? WHERE prod_id = ?',
        timeout: timeout, // 20s
        values: [productInfo, id],
    };

    DB.get().query(queryOption, function(error, results, fields) {
        if (error) {
            return done(error);
        } else {
            return done(results);
        }
    });
}

const searchProduct = (search, offset, limit, done) => {
    var queryOption = {};

    if(search.length == 0){
        queryOption = {
            sql: 'SELECT * FROM product WHERE status = 1 LIMIT ? OFFSET ?;',
            timeout: timeout, // 20s
            values: [limit, offset],
        };
    }else{
        queryOption = {
            sql: 'SELECT * FROM product WHERE status = 1 AND title LIKE \'%'+search+'%\' OR description LIKE \'%'+search+'%\' LIMIT ? OFFSET ?;',
            timeout: timeout, // 20s
            values: [limit, offset],
        };
    }

    DB.get().query(queryOption, function(error, results, fields) {
        if (error) {
            return done(error);
        } else {
            return done(results);
        }
    });
}

const addImage = (id, id_image, weight, done) => {
    var productImageInfo = {
        prod_id: id,
        image: id_image,
        weight: weight,
    };
    var queryOption = {
        sql: 'INSERT INTO prod_image SET ?',
        timeout: timeout, // 20s
        values: [productImageInfo],
    };

    DB.get().query(queryOption, function(error, results, fields) {
        if (error) {
            return done(error);
        } else {
            return done(results);
        }
    });
}

const deleteImage = (id, id_image, done) => {
    var productImageInfo = {
       status: 0,
    };
    var queryOption = {
        sql: 'UPDATE prod_image SET ? WHERE prod_id = ? AND image = ?',
        timeout: timeout, // 20s
        values: [productImageInfo, id, id_image],
    };

    DB.get().query(queryOption, function(error, results, fields) {
        if (error) {
            return done(error);
        } else {
            return done(results);
        }
    });
}

export default {
    addProduct,
    updateProduct,
    detailProduct,
    getImages,
    deleteProduct,
    searchProduct,
    addImage,
    deleteImage,
}
