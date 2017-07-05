'use strict'

const server = {
    host: process.env.HOST || 'localhost',
    port: process.env.HOST_PORT || 8000
};

const mysql = {
    host     : '172.17.0.1',
    port     : 4000,
    user     : 'root',
    password : 'rootAuthP4ss',
    database : 'smesgoonline',
    multipleStatements: true,
};

const ajv = {
    additionalProperties : false,
};

export default {
    server,
    mysql,
    ajv
};
