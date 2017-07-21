'use strict'


// import
import DB from '../db.js'

const timeout = 20000;

const getFaq = (done) => {
    var queryOption = {
        sql: 'SELECT * FROM `faq` WHERE `status` = 1 ;',
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

const detailFaq = (id, done) => {
    var queryOption = {
        sql: 'SELECT * FROM `faq` WHERE `question_id` = ? ;',
        timeout: timeout, // 40s
        values: [id]
    };

    DB.get().query(queryOption, function(error, results, fields) {
        if (error) {
            return done(error);
        } else if(results.length){
            return done(results[0]);
        } else{
            return done(results)
        }
    });
}

const getFaqById = (id, done) => {
    var queryOption = {
        sql: 'SELECT * FROM `faq` WHERE `question_id` = ?, `status` = 1 ;',
        timeout: timeout, // 40s
        values: [id],
    };

    DB.get().query(queryOption, function(error, results, fields) {
        if (error) {
            return done(error);
        } else if(results.length){
            return done(results[0]);
        }else{
            return done(results)
        }
    });
}

const addFaq = (faq, user_id, done) => {
    var faqInfo = {
        question: faq.question,
        answer: faq.answer,
        user_id: user_id,
        status: 1,
    };
    var queryOption = {
        sql: 'INSERT INTO `faq` SET ?',
        timeout: timeout, // 20s
        values: [faqInfo],
    };

    DB.get().query(queryOption, function(error, results, fields) {
        if (error) {
            return done(error);
        } else {
            return done(results);
        }
    });
}

const updateFaq = (id, faq, user_id, done) => {
    var faqInfo = {
        question: faq.question,
        answer: faq.answer,
        user_id: user_id,
    };
    var queryOption = {
        sql: 'UPDATE `faq` SET ? WHERE `question_id` = ?',
        timeout: timeout, // 20s
        values: [faqInfo, id],
    };

    DB.get().query(queryOption, function(error, results, fields) {
        if (error) {
            return done(error);
        } else {
            return done(results);
        }
    });
}

const deleteFaq = (id, user_id, done) => {
    var faqInfo = {
        user_id: user_id,
        status: 0,
    };
    var queryOption = {
        sql: 'UPDATE `faq` SET ? WHERE `question_id` = ?',
        timeout: timeout, // 20s
        values: [faqInfo, id],
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
    getFaq,
    addFaq,
    updateFaq,
    deleteFaq,
    getFaqById,
    detailFaq
}
