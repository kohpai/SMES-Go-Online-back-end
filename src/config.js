'use strict'

const server = {
    host: process.env.HOST || 'localhost',
    port: process.env.HOST_PORT || 8000
};

const mysql = {
    host     : 'localhost',
    port     : 4000,
    user     : 'root',
    password : 'root',
    database : 'sme',
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
