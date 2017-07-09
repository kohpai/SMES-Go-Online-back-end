'use strict'

const server = {
    host: process.env.HOST || '0.0.0.0',
    port: process.env.HOST_PORT || 5000
};

const mysql = {
    host     : 'smeregister.gsoftbiz.com',
    port     : 4000,
    user     : 'root',
    password : 'rootAuthP4ss',
    database : 'smesgoonline',
    multipleStatements: true,
};

const mysql_product = {
    host     : 'smeregister.gsoftbiz.com',
    port     : 4000,
    user     : 'root',
    password : 'rootAuthP4ss',
    database : 'smesgoproduct',
    multipleStatements: true,
};

const seaweedfs = {
    host    : 'smeregister.gsoftbiz.com',
    port    : 9333,
};

const ajv = {
    additionalProperties : false,
};

export default {
    server,
    mysql,
    mysql_product,
    seaweedfs,
    ajv,
};
