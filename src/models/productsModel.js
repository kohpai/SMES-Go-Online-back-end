'use strict'


// import
import DB from '../db.js';
import Hashids from 'hashids';
import EnterpriseModel from './enterpriseModel.js';

const timeout = 20000;

const addProduct = (input, user_id, create_user_id, create_channel, done) => {
    var productInfo = {
        title: input.title,
        sku: input.sku,
        unspsc: input.unspsc,
        category: input.category,
        no_of_pieces: input.no_of_pieces,
        price: input.price,
        barcode: input.barcode,
        description: input.description,
        amount: input.amount,
        cert_q: input.cert_q,
        cert_food_and_drug: input.cert_food_and_drug,
        cert_iso: input.cert_iso,
        cert_halan: input.cert_halan,
        cert_organic: input.cert_organic,
        cert_safefood: input.cert_safefood,
        cert_other: input.cert_other,
        user_id: user_id,
        subcategory: input.subcategory,
        subcategory_code: input.subcategory_code,
        create_user_id: create_user_id,
        create_datetime: new Date(),
        create_channel: create_channel,
    };
    var queryOption = {
        sql: 'INSERT INTO product SET ?',
        timeout: timeout, // 20s
        values: [productInfo],
    };

    DB.get_product().query(queryOption, function(error, results, fields) {
        if (error) {
            DB.check_connect_product(error)

            if(error.code == 'ER_DUP_ENTRY' && error.sqlMessage.match(/Duplicate entry ([a-zA-Z0-9'-]+) for key 'sku'/i)){
                return done("รหัสสินค้า ถูกใช้งานแล้ว", error);
            }else{
                return done("เกิดข้อผิดพลาด", error);
            }

        } else {
            return done(results, null);
        }
    });
}

const updateProduct = (id, input, update_user_id, done) => {
    var productInfo = {
        title: input.title,
        sku: input.sku,
        unspsc: input.unspsc,
        category: input.category,
        no_of_pieces: input.no_of_pieces,
        price: input.price,
        barcode: input.barcode,
        description: input.description,
        amount: input.amount,
        cert_q: input.cert_q,
        cert_food_and_drug: input.cert_food_and_drug,
        cert_iso: input.cert_iso,
        cert_halan: input.cert_halan,
        cert_organic: input.cert_organic,
        cert_safefood: input.cert_safefood,
        cert_other: input.cert_other,
        subcategory: input.subcategory,
        subcategory_code: input.subcategory_code,
        update_user_id: update_user_id,
        update_datetime: new Date(),
    };
    var queryOption = {
        sql: 'UPDATE product SET ? WHERE prod_id = ?',
        timeout: timeout, // 20s
        values: [productInfo, id],
    };

    DB.get_product().query(queryOption, function(error, results, fields) {
        if (error) {
            DB.check_connect_product(error)

            if(error.code == 'ER_DUP_ENTRY' && error.sqlMessage.match(/Duplicate entry ([a-zA-Z0-9'-]+) for key 'sku'/i)){
                return done("รหัสสินค้า ถูกใช้งานแล้ว", error);
            }else{
                return done("เกิดข้อผิดพลาด", error);
            }

        } else {
            return done(results, null);
        }
    });
}

const detailProduct = (id, done) => {
    var queryOption = {
        sql: 'SELECT * FROM product WHERE prod_id = ?',
        timeout: timeout, // 20s
        values: [id],
    };

    DB.get_product().query(queryOption, function(error, results, fields) {
        if (error) {
            DB.check_connect_product(error)
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

    DB.get_product().query(queryOption, function(error, results, fields) {
        if (error) {
            DB.check_connect_product(error)
            return done(error);
        }

        return done(results);
    });
}

const deleteProduct = (id, update_user_id, done) => {
    var productInfo = {
        sku: null,
        status: 0,
        update_user_id: update_user_id,
        update_datetime: new Date(),
    };
    var queryOption = {
        sql: 'UPDATE product SET ? WHERE prod_id = ?',
        timeout: timeout, // 20s
        values: [productInfo, id],
    };

    DB.get_product().query(queryOption, function(error, results, fields) {
        if (error) {
            DB.check_connect_product(error)
            return done(error);
        } else {
            return done(results);
        }
    });
}

const searchProduct = (search, user_id, offset, limit, done) => {
    var queryOption = {};

    if(search.length == 0){
        queryOption = {
            // LEFT JOIN prod_image ON product.prod_id = prod_image.prod_id && prod_image.status = 1
            sql: 'SELECT * FROM product WHERE user_id LIKE ? AND status = 1 LIMIT ? OFFSET ?;',
            timeout: timeout, // 20s
            values: [user_id, limit, offset],
        };
    }else{
        queryOption = {
            sql: 'SELECT * FROM product WHERE product.user_id LIKE ? AND product.status = 1 AND ( product.title LIKE \'%'+search+'%\' OR product.description LIKE \'%'+search+'%\' ) LIMIT ? OFFSET ?;',
            timeout: timeout, // 20s
            values: [user_id, limit, offset],
        };
    }

    DB.get_product().query(queryOption, function(error, results, fields) {
        if (error) {
            DB.check_connect_product(error)
            return done(error);
        } else {
            return done(results);
        }
    });
}

const countProduct = (search, user_id, done) => {
    var queryOption = {
        sql: 'SELECT COUNT(*) AS count FROM product WHERE user_id LIKE ? AND status = 1 AND ( title LIKE \'%'+search+'%\' OR description LIKE \'%'+search+'%\' );',
        timeout: timeout, // 20s
        values: [user_id],
    };

    DB.get_product().query(queryOption, function(error, results, fields) {
        if (error) {
            DB.check_connect_product(error)
            return done(error);
        } else if(results.length){
            return done(results[0]);
        }else{
            return done(results);
        }
    });
}

const findImage = (id, image_id, done) => {
    var queryOption = {
        sql: 'SELECT * FROM prod_image WHERE prod_id = ? AND image = ? AND status = 1;',
        timeout: timeout, // 20s
        values: [id, image_id],
    };

    DB.get_product().query(queryOption, function(error, results, fields) {
        if (error) {
            DB.check_connect_product(error)
            return done(error);
        }else if(results.length){
            return done(results[0])
        }else {
            return done(results);
        }
    });
}

const addImage = (id, id_image, name, weight, user_id, done) => {
    var productImageInfo = {
        prod_id: id,
        image: id_image,
        image_name: name,
        weight: weight,
        create_datetime: new Date(),
        create_user_id: user_id,
    };
    var queryOption = {
        sql: 'INSERT INTO prod_image SET ?',
        timeout: timeout, // 20s
        values: [productImageInfo],
    };

    DB.get_product().query(queryOption, function(error, results, fields) {
        if (error) {
            DB.check_connect_product(error)
            return done(error);
        } else {
            // set product image
            var productInfo = {
                image: id_image,
                update_datetime: new Date(),
                update_user_id: user_id,
            };
            var queryOption = {
                sql: 'UPDATE product SET ? WHERE prod_id = ? AND image IS NULL',
                timeout: timeout, // 20s
                values: [productInfo, id],
            };

            DB.get_product().query(queryOption, function(error, results_update_image, fields) {
                if (error) {
                    return done(error);
                } else {
                    return done(results);
                }
            })
        }
    });
}

const deleteImage = (id, id_image, is_change_image, user_id, done) => {
    var productImageInfo = {
        status: 0,
        delete_user_id: user_id,
    };
    var queryOption = {
        sql: 'UPDATE prod_image SET ? WHERE prod_id = ? AND image = ?',
        timeout: timeout, // 20s
        values: [productImageInfo, id, id_image],
    };

    DB.get_product().query(queryOption, function(error, results, fields) {
        if (error) {
            DB.check_connect_product(error)
            return done(error);
        } else {

          if(!is_change_image){
              return done(results)
          }

          // find product image
          var queryOption = {
              sql: 'SELECT * FROM prod_image WHERE prod_id = ? AND image <> ? AND status = 1 LIMIT 1',
              timeout: timeout, // 20s
              values: [id, id_image],
          };

          DB.get_product().query(queryOption, function(error, results_image, fields) {
              if (error) {
                  DB.check_connect_product(error)
                  return done(error);
              } else {

                  var new_image_id = null
                  if(results_image != null && results_image.length){
                      new_image_id = results_image[0].image
                  }

                  // set product image
                  var productInfo = {
                      image: new_image_id,
                      update_datetime: new Date(),
                      update_user_id: user_id,
                  };

                  var queryOption = {
                      sql: 'UPDATE product SET ? WHERE prod_id = ? AND image = ?',
                      timeout: timeout, // 20s
                      values: [productInfo, id, id_image],
                  };

                  DB.get_product().query(queryOption, function(error, results_update_image, fields) {
                      if (error) {
                          return done(error);
                      } else {
                          return done(results);
                      }
                  })
              }
          })
        }
    });
}

const addEmarket = (id, emarkets, done) => {

    emarkets.forEach(function(item, index) {
        var emarketInfo = {
            prod_id: id,
            emarket: item,
        };
        var queryOption = {
            sql: 'INSERT INTO prod_emarket SET ?',
            timeout: timeout, // 20s
            values: [emarketInfo],
        };

        DB.get_product().query(queryOption, function(error, results, fields) {
            if(index == emarkets.length - 1){
                if (error) {
                    DB.check_connect_product(error)
                    return done(error);
                } else {
                    return done(results);
                }
            }
        });
    });
}

const deleteEmarket = (id, done) => {

    var queryOption = {
        sql: 'DELETE FROM prod_emarket WHERE prod_id = ?',
        timeout: timeout, // 20s
        values: [id],
    };

    DB.get_product().query(queryOption, function(error, results, fields) {
        if (error) {
            DB.check_connect_product(error)
            return done(error);
        } else {
            return done(results);
        }
    });
}

const getEmarket = (id, done) => {

    var queryOption = {
        sql: 'SELECT * FROM prod_emarket WHERE prod_id = ?',
        timeout: timeout, // 20s
        values: [id],
    };

    DB.get_product().query(queryOption, function(error, results, fields) {
        if (error) {
            DB.check_connect_product(error)
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
    countProduct,
    addImage,
    deleteImage,
    addEmarket,
    deleteEmarket,
    getEmarket,
    findImage,
}
