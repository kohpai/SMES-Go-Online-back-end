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

const sms = {
    url : 'http://smeregister.gsoftbiz.com:5080/sms.php',
}

const wording = {
    token_invalid: 'The token is invalid.',
    token_expire: 'The token is expire.',
    otp_expire: 'The otp is expire.',
    not_found_user: 'Not found user.',
    not_found_machine_token: 'Not found machine token.',
    not_found_enterprise: 'Not found enterprise.',
    sms_otp: 'รหัส OTP คือ {{otp}} สำหรับ ref no. {{ref}} OTP จะหมดอายุภายใน 5 นาที',
    register_success: 'ท่านได้เข้าร่วม SMEsGoOnline แล้ว ใช้งานได้ที่ https://goo.gl/r9sP7s',
    profile_success: 'ระบบได้ทำการแก้ไขข้อมูลท่านเรียบร้อยแล้ว',
    otp_gen_already: 'หมายเลข OTP ได้ถูกส่งไปแล้ว กรุณารอสักครู่',
    bad_request: 'bad request.',
    password_incorrect: 'รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบ',
    otp_incorrect: 'หมายเลข OTP ไม่ถูกต้อง กรุณาตรวจสอบ',
    not_found_phone: 'ไม่พบหมายเลขโทรศัพท์มือถือในระบบ กรุณาตรวจสอบ',
}

const pwd = {
    jwt_secret: 'SME',
}

const expire = {
    login: 24, // h
    otp: 5, // m
    otp_gen: 1, // m
    otp_token: 10 // m
}

const ajv = {
    additionalProperties : false,
};

export default {
    server,
    mysql,
    mysql_product,
    seaweedfs,
    ajv,
    sms,
    wording,
    pwd,
    expire
};
