var mysql = require('mysql');
var config = require('./config').config;
var log = require('./log').logger;


function query(dbInfo, sql) {
    var pool = mysql.createPool(dbInfo);
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) {
                log.info('MySql connection Error:', JSON.stringify(err));
                reject(err);
                return
            }
            connection.query(sql, [], (err, rows) => {
                if (err) {
                    log.info('MySql query Error:', JSON.stringify(err));
                    reject(err);
                    return
                }
                resolve(rows);
                connection.release();
            })
        })
    })
}

module.exports = {
    query: query
}