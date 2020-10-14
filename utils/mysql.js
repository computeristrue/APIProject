var mysql = require('mysql');
var config = require('../utils/config').config;
var log = require('../utils/log').logger;

var pool = mysql.createPool(config.db);
function query(sql) {
    return new Promise((resolve, reject) => {
        pool.getConnection(function (err, connection) {
            if (err) {
                console.log(err);
            }
            connection.query(sql, [], (err, rows) => {
                if (err) {
                    log.info('MySql execute Error:' + JSON.stringify(err));
                    reject(err);
                    return
                }
                resolve(rows);
                connection.release();
            })
        })
    });
}
module.exports = {
    query: query
}
// exports.connection = connection;