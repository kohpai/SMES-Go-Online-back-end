var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : '172.17.0.2',
  user     : 'root',
  password : 'root',
  database : 'new_database'
});

connection.connect();

connection.query('SELECT * FROM users', function (error, results, fields) {
    if (error)
        throw error;

    console.log('The result is: ', results);
});

connection.end();
