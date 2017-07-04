'use strict'


// import
import DB from '../db.js'

const timeout = 20000;

const getNews = (done) => {
    var queryOption = {
        sql: 'SELECT * FROM `news`;',
        timeout: timeout, // 40s
    };

    DB.get().query(queryOption, function(error, results, fields) {
        if (error) {
            return done(error);
        } else {
            results.forEach(function(value) {
                delete value.news_id;
            });

            return done(results);
        }
    });
}

export default {
    getNews
}
