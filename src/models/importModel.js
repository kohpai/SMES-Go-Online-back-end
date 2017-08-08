'use strict'


// import
import DB from '../db.js';

const timeout = 20000;

const addImport = (ts, type, filename, user_id, done) => {
    var importInfo = {
        import_id: ts,
        import_type: type,
        import_filename: filename,
        create_datetime: new Date(),
        user_id: user_id,
    };
    var queryOption = {
        sql: 'INSERT INTO import SET ?',
        timeout: timeout, // 20s
        values: [importInfo],
    };

    DB.get().query(queryOption, function(error, results, fields) {
        if (error) {
            return done(error);
        } else {
            return done(results);
        }
    });
}

const addImportDetail = (ts, row, success, result, error, done) => {
    console.log(ts+':'+row+':'+result)
    var importDetailInfo = {
        import_id: ts,
        import_row: row,
        success:success,
        result: result,
        error: error,
        update_datetime: new Date(),
    };
    var queryOption = {
        sql: 'INSERT INTO import_detail SET ?',
        timeout: timeout, // 20s
        values: [importDetailInfo],
    };

    DB.get().query(queryOption, function(error, results, fields) {
        if (error) {
            return done(error);
        } else {
            return done(results);
        }
    });
}

const getImportList = (import_type, offset, limit, done) => {
    var queryOption = {
        sql: 'SELECT * FROM import WHERE import_type = ? ORDER BY import_id DESC LIMIT ? OFFSET ?;',
        timeout: timeout, // 20s
        values: [import_type, limit, offset],
    };

    DB.get().query(queryOption, function(error, import_result, fields) {
        if (error) {
            return done(error);
        } else {
            return done(import_result)
        }
    });
}

const getImportListCount = (import_type, done) => {
    var queryOption = {
        sql: 'SELECT COUNT(*) AS count FROM import WHERE import_type = ?;',
        timeout: timeout, // 20s
        values: [import_type],
    };

    DB.get().query(queryOption, function(error, import_result, fields) {
        if (error) {
            return done(error);
        } else if(import_result.length){
            return done(import_result[0])
        }else{
            return done(import_result)
        }
    });
}

const getImport = (id, offset, limit, done) => {
    var queryOption = {
        sql: 'SELECT * FROM import WHERE import_id = ?;',
        timeout: timeout, // 20s
        values: [id],
    };

    DB.get().query(queryOption, function(error, import_result, fields) {
        if (error) {
            return done(error);
        } else {

            if(import_result.length){
                import_result = import_result[0]
            }

            var queryOption = {
                sql: 'SELECT * FROM import_detail WHERE import_id = ? ORDER BY success, import_row LIMIT ? OFFSET ?;',
                timeout: timeout, // 20s
                values: [id, limit, offset],
            };

            DB.get().query(queryOption, function(error, import_detail_result, fields) {
                if (error) {
                    return done(error);
                } else {

                    import_result.rows = import_detail_result
                    return done(import_result)
                }
            })
        }
    });
}

const getImportCount = (id, done) => {
    var queryOption = {
        sql: 'SELECT COUNT(*) AS count FROM import_detail WHERE import_id = ?;',
        timeout: timeout, // 20s
        values: [id],
    };

    DB.get().query(queryOption, function(error, import_result, fields) {
        if (error) {
            return done(error);
        } else if(import_result.length){
            return done(import_result[0])
        }else{
            return done(import_result)
        }
    });
}

export default {
    addImport,
    addImportDetail,
    getImport,
    getImportCount,
    getImportList,
    getImportListCount
}
