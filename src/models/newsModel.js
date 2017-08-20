'use strict'


// import
import DB from '../db.js'

const timeout = 20000;

const getNews = (offset, limit, done) => {
    var queryOption = {
        sql: 'SELECT * FROM `news` WHERE `status` = 1 LIMIT ? OFFSET ?;',
        timeout: timeout, // 40s
        values: [limit, offset],
    };

    DB.get().query(queryOption, function(error, results, fields) {
        if (error) {
            DB.check_connect(error)
            return done(error);
        } else {
            return done(results);
        }
    });
}

const countNews = (done) => {
    var queryOption = {
        sql: 'SELECT COUNT(*) AS count FROM `news` WHERE `status` = 1;',
        timeout: timeout, // 40s
    };

    DB.get().query(queryOption, function(error, results, fields) {
        if (error) {
            DB.check_connect(error)
            return done(error);
        } else if(results.length){
            return done(results[0]);
        }else{
            return done(results);
        }
    });
}

const detailNews = (id, done) => {
    var queryOption = {
        sql: 'SELECT * FROM `news` WHERE `news_id` = ?;',
        timeout: timeout, // 40s
        values: [id],
    };

    DB.get().query(queryOption, function(error, results, fields) {
        if (error) {
            DB.check_connect(error)
            return done(error);
        } else if(results.length){
            return done(results[0]);
        }else{
            return done(results)
        }
    });
}

const addNews = (news, user_id, done) => {
    var newsInfo = {
        title: news.title,
        content: news.content,
        updated_at: new Date(),
        user_id: user_id,
        status: 1,
    };
    var queryOption = {
        sql: 'INSERT INTO `news` SET ?',
        timeout: timeout, // 20s
        values: [newsInfo],
    };

    DB.get().query(queryOption, function(error, results, fields) {
        if (error) {
            DB.check_connect(error)
            return done(error);
        } else {
            return done(results);
        }
    });
}

const updateNews = (id, news, user_id, done) => {
    var newsInfo = {
        title: news.title,
        content: news.content,
        updated_at: new Date(),
        user_id: user_id,
        status: 1,
    };
    var queryOption = {
        sql: 'UPDATE `news` SET ? WHERE `news_id` = ?',
        timeout: timeout, // 20s
        values: [newsInfo, id],
    };

    DB.get().query(queryOption, function(error, results, fields) {
        if (error) {
            DB.check_connect(error)
            return done(error);
        } else {
            return done(results);
        }
    });
}

const deleteNews = (id, user_id, done) => {
    var newsInfo = {
        user_id: user_id,
        status: 0,
    };
    var queryOption = {
        sql: 'UPDATE `news` SET ? WHERE `news_id` = ?',
        timeout: timeout, // 20s
        values: [newsInfo, id],
    };

    DB.get().query(queryOption, function(error, results, fields) {
        if (error) {
            DB.check_connect(error)
            return done(error);
        } else {
            return done(results);
        }
    });
}

const updateImage = (id, fid, file_name, done) => {
    var newsInfo = {
        image: fid,
        image_name: file_name,
    };
    var queryOption = {
        sql: 'UPDATE `news` SET ? WHERE `news_id` = ?',
        timeout: timeout, // 20s
        values: [newsInfo, id],
    };

    DB.get().query(queryOption, function(error, results, fields) {
        if (error) {
            DB.check_connect(error)
            return done(error);
        } else {
            return done(results);
        }
    });
}

const findImage = (id, image_id, done) => {
    var queryOption = {
        sql: 'SELECT * FROM news WHERE news_id = ? AND image = ? AND status = 1;',
        timeout: timeout, // 20s
        values: [id, image_id],
    };

    DB.get().query(queryOption, function(error, results, fields) {
        if (error) {
            DB.check_connect(error)
            return done(error);
        }else if(results.length){
            return done(results[0])
        }else {
            return done(results);
        }
    });
}

export default {
    getNews,
    countNews,
    addNews,
    updateNews,
    deleteNews,
    updateImage,
    findImage,
    detailNews,
}
