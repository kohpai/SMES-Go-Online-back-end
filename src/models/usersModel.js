'use strict'


// import
import DB from '../db.js';
import Hashids from 'hashids';
import EnterpriseModel from './enterpriseModel.js';

const timeout = 20000;

const deleteUser = (id, done) => {

    var queryOption = {
        sql: 'DELETE FROM user WHERE user_id = ?',
        timeout: timeout, // 20s
        values: [id],
    };

    DB.get().query(queryOption, function(error, results, fields) {
        if (error) {
            return done(error);
        } else {
            return done(results);
        }
    });
}

const deleteContact = (id, done) => {

    var queryOption = {
        sql: 'DELETE FROM contact WHERE contact_id = ?',
        timeout: timeout, // 20s
        values: [id],
    };

    DB.get().query(queryOption, function(error, results, fields) {
        if (error) {
            return done(error);
        } else {
            return done(results);
        }
    });
}

const getUserById = (id, done) => {
    var queryOption = {
        sql: 'SELECT * FROM `user` WHERE `user_id` = ?;',
        timeout: timeout, // 20s
        values: [id],
    };

    DB.get().query(queryOption, function(error, results, fields) {
        if (error) {
            return done(error);
        } else if (results.length) {
            delete results[0].password;
            return done(results[0]);
        }

        return done(null);
    });
}

const getEnterpriseByUserId = (id, done) => {
    var queryOption = {
        sql: 'SELECT * FROM `enterprise` WHERE `user_id` = ?;',
        timeout: timeout, // 20s
        values: [id],
    };

    DB.get().query(queryOption, function(error, results, fields) {
        if (error)
            return done(error);
        else if (results.length)
            return done(results[0]);

        return done(null);
    });
}

const addUser = (input, user_id, create_channel, done) => {

    if(input.phone_no.startsWith('66')){
        input.phone_no = '0'+input.phone_no.slice(2)
    }else if(input.phone_no.startsWith('+66')){
        input.phone_no = '0'+input.phone_no.slice(3)
    }

    var userInfo = {
        username: input.phone_no,
        full_name: input.title+" "+input.name+" "+input.lastname,
        role: 'user',
        updated_at: new Date()
    };
    var queryOption = {
        sql: 'INSERT INTO user SET ?',
        timeout: timeout, // 20s
        values: [userInfo],
    };

    DB.get().query(queryOption, function(error, results, fields) {
        if (error) {
            if(error.code == 'ER_DUP_ENTRY' && error.sqlMessage.match(/Duplicate entry ([a-zA-Z0-9'-]+) for key 'username'/i)){
                return done("หมายเลขโทรศัพท์ของท่านมีการลงทะเบียนแล้ว กรุณาตรวจสอบ", error);
            }else{
                return done("เกิดข้อผิดพลาด", error);
            }
        } else {

            input.user_id = results.insertId;

            if(input.enterprise_type.agricultural_product.length){
                input.is_agricultural_product = true
            }else{
                input.is_agricultural_product = false
            }
            input.agricultural_product = input.enterprise_type.agricultural_product

            if(input.enterprise_type.industrial_product.length){
                input.is_industrial_product = true
            }else{
                input.is_industrial_product = false
            }
            input.industrial_product = input.enterprise_type.industrial_product

            if(input.enterprise_type.selling.length){
                input.is_selling = true
            }else{
                input.is_selling = false
            }
            input.selling = input.enterprise_type.selling

            if(input.enterprise_type.service.length){
                input.is_service = true
            }else{
                input.is_service = false
            }
            input.service = input.enterprise_type.service

            if(input.enterprise_type.other.length){
                input.is_other = true
            }else{
                input.is_other = false
            }
            input.other = input.enterprise_type.other

            if(!input.legal_title || !input.legal_title.length){
                input.legal_title = null
            }

            if(!input.legal_name || !input.legal_name.length){
                input.legal_name = null
            }

            if(!input.legal_id || !input.legal_id.length){
                input.legal_id = null
            }

            if(!input.sme_member_no || input.sme_member_no.length == 0){
                input.sme_member_no = null
            }

            input.needed_help_ecommerce = input.needed_help.needed_help_ecommerce
            input.needed_help_investor = input.needed_help.needed_help_investor
            input.needed_help_supplier = input.needed_help.needed_help_supplier
            input.needed_help_payment = input.needed_help.needed_help_payment
            input.needed_help_logistics = input.needed_help.needed_help_logistics
            input.needed_help_brand = input.needed_help.needed_help_brand
            input.needed_help_online_marketing = input.needed_help.needed_help_online_marketing
            input.needed_help_tax = input.needed_help.needed_help_tax

            var date = new Date();
            date.setFullYear(date.getFullYear() - input.age)
            date.setMonth(0)
            date.setDate(1)
            input.birthyear = date.toISOString().split('T')[0];

            delete input.phone_no;
            delete input.enterprise_type;
            delete input.needed_help;
            delete input.age;

            if(input.registration_type != 3){
                input.legal_title = null
                input.legal_name = null
                input.legal_id = null
            }

            if(user_id){
                input.create_user_id = user_id
            }

            input.create_datetime = new Date()

            input.create_channel = create_channel

            /*if (input.contact_info && input.registration_type == 3) {

                input.contact_info.full_name = input.contact_info.title+' '+input.contact_info.name+' '+input.contact_info.lastname

                EnterpriseModel.addContact(input.contact_info, function(insertId) {
                    if (insertId instanceof Error) {
                        // delete user
                        deleteUser(input.user_id, (r) => { })
                        return done('เลขที่บัตรประชาชน ผู้ติดต่อของท่านมีการลงทะเบียนแล้ว กรุณาตรวจสอบ', insertId);
                    }
                    input.contact_id = insertId;
                    delete input.contact_info;

                    EnterpriseModel.addEnterprise(input, function(insertId) {
                        if (insertId instanceof Error) {
                            // delete user & contact
                            deleteUser(input.user_id, (r) => { })
                            deleteContact(insertId, (r) => { })
                            return done('เลขที่จดทะเบียนนิติบุคคล หรือ เลขที่บัตรประชาชน หรือ เลขสมาชิก สสว. มีการลงทะเบียนแล้ว กรุณาตรวจสอบ', insertId)
                        }else {
                            return done(input.user_id, null)
                        }
                    });
                });
            } else {

                delete input.contact_info;
                */
                EnterpriseModel.addEnterprise(input, function(insertId) {
                    if (insertId instanceof Error) {
                        // delete user
                        deleteUser(input.user_id, (r) => { })

                        if(insertId.code == 'ER_DUP_ENTRY' && insertId.sqlMessage.match(/Duplicate entry ([a-zA-Z0-9'-]+) for key 'registration_type'/i)){
                            return done('เลขที่บัตรประชาชน มีการลงทะเบียนแล้ว กรุณาตรวจสอบ', insertId)

                        }else if(insertId.code == 'ER_DUP_ENTRY' && insertId.sqlMessage.match(/Duplicate entry ([a-zA-Z0-9'-]+) for key 'sme_member_no'/i)){
                            return done('เลขที่จดทะเบียนนิติบุคคล มีการลงทะเบียนแล้ว กรุณาตรวจสอบ', insertId)

                        }else if(insertId.code == 'ER_DUP_ENTRY' && insertId.sqlMessage.match(/Duplicate entry ([a-zA-Z0-9'-]+) for key 'legal_id'/i)){
                            return done('ลขสมาชิก สสว. มีการลงทะเบียนแล้ว กรุณาตรวจสอบ', insertId)

                        }else{
                            return done('เกิดข้อผิดพลาด', insertId)
                        }

                    }else {
                        return done(input.user_id, null)
                    }
                })
            /*}*/
        }
    });
}

const updateUser = (id, input, user_id, done) => {

    var userInfo = {
        full_name: input.title+" "+input.name+" "+input.lastname,
        role: 'user',
        updated_at: new Date()
    };
    var queryOption = {
        sql: 'UPDATE user SET ? WHERE user_id = ?',
        timeout: timeout, // 20s
        values: [userInfo, id],
    };

    DB.get().query(queryOption, function(error, results, fields) {
        if (error) {
            if(error.code == 'ER_DUP_ENTRY' && error.sqlMessage.match(/Duplicate entry ([a-zA-Z0-9'-]+) for key 'username'/i)){
                return done("หมายเลขโทรศัพท์ของท่านมีการลงทะเบียนแล้ว กรุณาตรวจสอบ", error);
            }else{
                return done("เกิดข้อผิดพลาด", error);
            }
        } else {

            // input.user_id = id;

            if(input.enterprise_type.agricultural_product.length){
                input.is_agricultural_product = true
            }else{
                input.is_agricultural_product = false
            }
            input.agricultural_product = input.enterprise_type.agricultural_product

            if(input.enterprise_type.industrial_product.length){
                input.is_industrial_product = true
            }else{
                input.is_industrial_product = false
            }
            input.industrial_product = input.enterprise_type.industrial_product

            if(input.enterprise_type.selling.length){
                input.is_selling = true
            }else{
                input.is_selling = false
            }
            input.selling = input.enterprise_type.selling

            if(input.enterprise_type.service.length){
                input.is_service = true
            }else{
                input.is_service = false
            }
            input.service = input.enterprise_type.service

            if(input.enterprise_type.other.length){
                input.is_other = true
            }else{
                input.is_other = false
            }
            input.other = input.enterprise_type.other

            if(!input.legal_title || !input.legal_title.length){
                input.legal_title = null
            }

            if(!input.legal_name || !input.legal_name.length){
                input.legal_name = null
            }

            if(!input.legal_id || !input.legal_id.length){
                input.legal_id = null
            }

            if(!input.sme_member_no || input.sme_member_no.length == 0){
                input.sme_member_no = null
            }

            input.needed_help_ecommerce = input.needed_help.needed_help_ecommerce
            input.needed_help_investor = input.needed_help.needed_help_investor
            input.needed_help_supplier = input.needed_help.needed_help_supplier
            input.needed_help_payment = input.needed_help.needed_help_payment
            input.needed_help_logistics = input.needed_help.needed_help_logistics
            input.needed_help_brand = input.needed_help.needed_help_brand
            input.needed_help_online_marketing = input.needed_help.needed_help_online_marketing
            input.needed_help_tax = input.needed_help.needed_help_tax

            var date = new Date();
            date.setFullYear(date.getFullYear() - input.age)
            date.setMonth(0)
            date.setDate(1)
            input.birthyear = date.toISOString().split('T')[0];

            // delete input.phone_no;
            delete input.enterprise_type;
            delete input.needed_help;
            delete input.age;

            if(input.registration_type != 3){
                input.legal_title = null
                input.legal_name = null
                input.legal_id = null
            }

            if(user_id){
                input.update_user_id = user_id
            }

            input.update_datetime = new Date()

            EnterpriseModel.updateEnterprise(id, input, function(result) {
                if (result instanceof Error) {

                    if(result.code == 'ER_DUP_ENTRY' && result.sqlMessage.match(/Duplicate entry ([a-zA-Z0-9'-]+) for key 'registration_type'/i)){
                        return done('เลขที่บัตรประชาชน มีการลงทะเบียนแล้ว กรุณาตรวจสอบ', id)

                    }else if(result.code == 'ER_DUP_ENTRY' && result.sqlMessage.match(/Duplicate entry ([a-zA-Z0-9'-]+) for key 'sme_member_no'/i)){
                        return done('เลขที่จดทะเบียนนิติบุคคล มีการลงทะเบียนแล้ว กรุณาตรวจสอบ', id)

                    }else if(result.code == 'ER_DUP_ENTRY' && result.sqlMessage.match(/Duplicate entry ([a-zA-Z0-9'-]+) for key 'legal_id'/i)){
                        return done('ลขสมาชิก สสว. มีการลงทะเบียนแล้ว กรุณาตรวจสอบ', id)

                    }else{
                        return done('เกิดข้อผิดพลาด', result)
                    }

                }else {
                    return done(result, null)
                }
            })
        }
    });
}

const authenUser = (username, password, done) => {
    var queryOption = {
        sql: 'SELECT * FROM `user` WHERE `username` = ? AND `password` = ?',
        timeout: timeout, // 20s
        values: [username, password],
    };

    DB.get().query(queryOption, function(error, results, fields) {
        if (error) {
            return done(error);
        } else if (results.length) {
            return done(results[0]);
        } else {
            return done(results);
        }
    });
}

const findUser = (id, done) => {
    var queryOption = {
        sql: 'SELECT * FROM `user` WHERE `user_id` = ?',
        timeout: timeout, // 20s
        values: [id],
    };

    DB.get().query(queryOption, function(error, results, fields) {
        if (error) {
            return done(error);
        } else if (results.length) {
            return done(results[0]);
        } else {
            return done(results);
        }
    });
}

const findUserByUsername = (username, done) => {
    var queryOption = {
        sql: 'SELECT * FROM `user` WHERE `username` = ?',
        timeout: timeout, // 20s
        values: [username],
    };

    DB.get().query(queryOption, function(error, results, fields) {
        if (error) {
            return done(error);
        } else if (results.length) {
            return done(results[0]);
        } else {
            return done(results);
        }
    });
}

const updateOtp = (username, otp, ref, done) => {
    var queryOption = {
        sql: 'UPDATE `user` SET `otp` = ?, `otp_gen` = ?, `otp_ref` = ? WHERE `username` = ?',
        timeout: timeout, // 20s
        values: [otp, new Date(), ref, username],
    };

    DB.get().query(queryOption, function(error, results, fields) {
        if (error) {
            return done(error);
        } else if (results.length) {
            return done(results[0]);
        } else {
            return done(results);
        }
    });
}

const updatePin = (user_id, pin, done) => {
    var queryOption = {
        sql: 'UPDATE `user` SET `password` = ?, `otp` = NULL WHERE `user_id` = ?',
        timeout: timeout, // 20s
        values: [pin, user_id],
    };

    DB.get().query(queryOption, function(error, results, fields) {
        if (error) {
            return done(error);
        } else if (results.length) {
            return done(results[0]);
        } else {
            return done(results);
        }
    });
}

const updatePhone = (user_id, phone_number, done) => {
    var queryOption = {
        sql: 'UPDATE `user` SET `username` = ? WHERE `user_id` = ?',
        timeout: timeout, // 20s
        values: [phone_number, user_id],
    };

    DB.get().query(queryOption, function(error, results, fields) {
        if (error) {
            return done(error);
        } else if (results.length) {
            return done(results[0]);
        } else {
            return done(results);
        }
    });
}

const findMachine = (token, done) => {
    var queryOption = {
        sql: 'SELECT * FROM `user_machine` WHERE `machine_token` = ?',
        timeout: timeout, // 20s
        values: [token],
    };

    DB.get().query(queryOption, function(error, results, fields) {
        if (error) {
            return done(error);
        } else if (results.length) {
            return done(results[0]);
        } else {
            return done(results);
        }
    });
}

const addMachine = (input, done) => {
    var queryOption = {
        sql: 'INSERT INTO `user_machine` SET ? ',
        timeout: timeout, // 20s
        values: [input],
    };

    DB.get().query(queryOption, function(error, results, fields) {
        if (error) {
            return done(error);
        } else if (results.length) {
            return done(results[0]);
        } else {
            return done(results);
        }
    });
}

const updateMachine = (token, user_id, otp_pass, done) => {
    var queryOption = {
        sql: 'UPDATE `user_machine` SET `access_datetime` = ?, `user_id` = ?, `otp_pass` = ? WHERE `machine_token` = ?',
        timeout: timeout, // 20s
        values: [new Date(), user_id, otp_pass, token],
    };

    DB.get().query(queryOption, function(error, results, fields) {
        if (error) {
            return done(error);
        } else if (results.length) {
            return done(results[0]);
        } else {
            return done(results);
        }
    });
}

const updatePassMachine = (token, done) => {
    var queryOption = {
        sql: 'UPDATE `user_machine` SET `access_datetime` = ? , `otp_pass` = 1 WHERE `machine_token` = ?',
        timeout: timeout, // 20s
        values: [new Date(), token],
    };

    DB.get().query(queryOption, function(error, results, fields) {
        if (error) {
            return done(error);
        } else if (results.length) {
            return done(results[0]);
        } else {
            return done(results);
        }
    });
}

const countUsers = (search, done) => {
    var queryOption = {
        sql: 'SELECT COUNT(*) AS count FROM user LEFT JOIN enterprise ON user.user_id = enterprise.user_id WHERE user.is_admin = 0 AND user.is_admin = 0 AND ( user.full_name LIKE \'%'+search+'%\' OR user.username LIKE \'%'+search+'%\' OR enterprise.enterprise_name LIKE \'%'+search+'%\' );',
        timeout: timeout, // 20s
        values: [search],
    };

    DB.get().query(queryOption, function(error, results, fields) {
        if (error) {
            return done(error);
        } else if(results.length){
            return done(results[0]);
        }else{
            return done(results);
        }
    });
}

const searchUsers = (search, offset, limit, done) => {
    var queryOption = {};

    if(search.length == 0){
        queryOption = {
            sql: 'SELECT * FROM user LEFT JOIN enterprise ON user.user_id = enterprise.user_id WHERE user.is_admin = 0 LIMIT ? OFFSET ?;',
            timeout: timeout, // 20s
            values: [limit, offset],
        };
    }else{
        queryOption = {
            sql: 'SELECT * FROM user LEFT JOIN enterprise ON user.user_id = enterprise.user_id WHERE user.is_admin = 0 AND ( user.full_name LIKE \'%'+search+'%\' OR user.username LIKE \'%'+search+'%\' OR enterprise.enterprise_name LIKE \'%'+search+'%\' ) LIMIT ? OFFSET ?;',
            timeout: timeout, // 20s
            values: [limit, offset],
        };
    }

    DB.get().query(queryOption, function(error, results, fields) {
        if (error) {
            return done(error);
        } else {

            for(var i in results){
                delete results[i].password
                delete results[i].otp
                delete results[i].otp_ref
            }

            return done(results);
        }
    });
}

const detailUser = (id, done) => {
    var queryOption = {
        sql: 'SELECT * FROM user WHERE user_id = ?',
        timeout: timeout, // 20s
        values: [id],
    };

    DB.get().query(queryOption, function(error, results, fields) {
        if (error) {
            return done(error);
        } else if(results.length) {

            delete results[0].password
            delete results[0].otp
            delete results[0].otp_ref

            return done(results[0]);
        }

        delete results.password
        delete results.otp
        delete results.otp_ref

        return done(results);
    });
}

const countAdmin = (search, done) => {
    var queryOption = {
        sql: 'SELECT COUNT(*) AS count FROM user WHERE is_admin = 1 AND ( full_name LIKE \'%'+search+'%\' OR username LIKE \'%'+search+'%\' );',
        timeout: timeout, // 20s
        values: [search],
    };

    DB.get().query(queryOption, function(error, results, fields) {
        if (error) {
            return done(error);
        } else if(results.length){
            return done(results[0]);
        }else{
            return done(results);
        }
    });
}

const searchAdmin = (search, offset, limit, done) => {
    var queryOption = {};

    if(search.length == 0){
        queryOption = {
            sql: 'SELECT * FROM user WHERE is_admin = 1 LIMIT ? OFFSET ?;',
            timeout: timeout, // 20s
            values: [limit, offset],
        };
    }else{
        queryOption = {
            sql: 'SELECT * FROM user is_admin = 1 AND ( full_name LIKE \'%'+search+'%\' OR username LIKE \'%'+search+'%\' ) LIMIT ? OFFSET ?;',
            timeout: timeout, // 20s
            values: [limit, offset],
        };
    }

    DB.get().query(queryOption, function(error, results, fields) {
        if (error) {
            return done(error);
        } else {

            for(var i in results){
                delete results[i].password
                delete results[i].otp
                delete results[i].otp_ref
            }

            return done(results);
        }
    });
}

const addAdmin = (input, done) => {

    if (input.phone_no.startsWith('66')) {
        input.phone_no = '0' + input.phone_no.slice(2)
    } else if (input.phone_no.startsWith('+66')) {
        input.phone_no = '0' + input.phone_no.slice(3)
    }

    var userInfo = {
        username: input.phone_no,
        full_name: input.title + " " + input.name + " " + input.lastname,
        role: 'admin',
        role_id: input.role_id,
        is_admin: 1,
        updated_at: new Date()
    };
    var queryOption = {
        sql: 'INSERT INTO user SET ?',
        timeout: timeout, // 20s
        values: [userInfo],
    };

    DB.get().query(queryOption, function (error, results, fields) {
        if (error) {
            return done("หมายเลขโทรศัพท์ของท่านมีการลงทะเบียนแล้ว กรุณาตรวจสอบ", error);
        } else {
            return done(results, null)
        }
    })
}

const updateAdmin = (id, input, done) => {

    // if (input.phone_no.startsWith('66')) {
    //     input.phone_no = '0' + input.phone_no.slice(2)
    // } else if (input.phone_no.startsWith('+66')) {
    //     input.phone_no = '0' + input.phone_no.slice(3)
    // }

    var userInfo = {
        // username: input.phone_no,
        full_name: input.title + " " + input.name + " " + input.lastname,
        role: 'admin',
        role_id: input.role_id,
        is_admin: 1,
        updated_at: new Date()
    };
    var queryOption = {
        sql: 'UPDATE user SET ? WHERE user_id = ?',
        timeout: timeout, // 20s
        values: [userInfo, id],
    };

    DB.get().query(queryOption, function (error, results, fields) {
        if (error) {
            return done("หมายเลขโทรศัพท์ของท่านมีการลงทะเบียนแล้ว กรุณาตรวจสอบ", error);
        } else {
            return done(results, null)
        }
    })
}

const getRole = (done) => {
    var queryOption = {
        sql: 'SELECT * FROM role;',
        timeout: timeout, // 20s
    };

    DB.get().query(queryOption, function(error, result, fields) {
        if (error) {
            return done(error);
        } else {
            return done(result);
        }
    });
}

const detailRole = (id, done) => {
    var queryOption = {
        sql: 'SELECT * FROM role WHERE role_id = ?;',
        timeout: timeout, // 20s
        values: [id]
    };

    DB.get().query(queryOption, function(error, result, fields) {
        if (error) {
            return done(error);
        } else if(result.length){
            return done(result[0]);
        }
        return done(result);
    });
}

export default {
    authenUser,
    addUser,
    updateUser,
    getUserById,
    findUser,
    getEnterpriseByUserId,
    findUserByUsername,
    updateOtp,
    updatePin,
    findMachine,
    addMachine,
    updateMachine,
    updatePassMachine,
    countUsers,
    searchUsers,
    detailUser,
    updatePhone,
    countAdmin,
    searchAdmin,
    addAdmin,
    updateAdmin,
    getRole,
    detailRole
}
