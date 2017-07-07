'use strict'


// import
import DB from '../db.js'

const timeout = 20000;

const getFaq = (done) => {
    var queryOption = {
        sql: 'SELECT * FROM `faq`;',
        timeout: timeout, // 40s
    };

    DB.get().query(queryOption, function(error, results, fields) {
        if (error) {
            return done(error);
        } else {
            return done(results);
        }
    });
}

export default {
    getFaq
}
