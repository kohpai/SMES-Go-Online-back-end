'use strict'

const server = {
    host: process.env.HOST || 'localhost',
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
    seaweedfs,
    ajv,
};
