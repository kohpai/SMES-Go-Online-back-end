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

const addUser = (input, done) => {
    var hashids = new Hashids(input.phone_no);

    if(input.phone_no.startsWith('66')){
        input.phone_no = '0'+input.phone_no.slice(2)
    }else if(input.phone_no.startsWith('+66')){
        input.phone_no = '0'+input.phone_no.slice(3)
    }

    var userInfo = {
        //user_id: hashids.encode(1, 2, 3, 4, 5),
        username: input.phone_no,
        //password: hashids.encode(6, 7, 8),
        full_name: input.title+" "+input.name+" "+input.lastname,
        role: 'user'
    };
    var queryOption = {
        sql: 'INSERT INTO user SET ?',
        timeout: timeout, // 20s
        values: [userInfo],
    };

    DB.get().query(queryOption, function(error, results, fields) {
        if (error) {
            return done("หมายเลขโทรศัพท์ของท่านมีการลงทะเบียนแล้ว กรุณาตรวจสอบ", error);
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

            if(input.sme_member_no.length == 0){
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

            if (input.contact_info && input.registration_type == 3) {

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
                            return done('เลขที่จดทะเบียนนิติบุคคล / เลขที่บัตรประชาชน / เลขสมาชิก สสว. มีการลงทะเบียนแล้ว กรุณาตรวจสอบ', insertId)
                        }else {
                            return done(input.user_id, null)
                        }
                    });
                });
            } else {

                delete input.contact_info;

                EnterpriseModel.addEnterprise(input, function(insertId) {
                    if (insertId instanceof Error) {
                        // delete user
                        deleteUser(input.user_id, (r) => { })
                        return done('เลขที่จดทะเบียนนิติบุคคล / เลขที่บัตรประชาชน มีการลงทะเบียนแล้ว กรุณาตรวจสอบ', insertId)
                    }else {
                        return done(input.user_id, null)
                    }
                });
            }
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

const findUser = (username, done) => {
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

const updateOtp = (username, otp, done) => {
    var queryOption = {
        sql: 'UPDATE `user` SET `otp` = ?, `otp_gen` = ? WHERE `username` = ?',
        timeout: timeout, // 20s
        values: [otp, new Date(), username],
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

const updatePin = (username, pin, done) => {
    var queryOption = {
        sql: 'UPDATE `user` SET `password` = ? WHERE `username` = ?',
        timeout: timeout, // 20s
        values: [pin, username],
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

const updateMachine = (token, done) => {
    var queryOption = {
        sql: 'UPDATE `user_machine` SET `access_datetime` = ? WHERE `machine_token` = ?',
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

export default {
    authenUser,
    addUser,
    getUserById,
    getEnterpriseByUserId,
    findUser,
    updateOtp,
    updatePin,
    findMachine,
    addMachine,
    updateMachine,
    updatePassMachine,
}
