var mysql = require('mysql');
var config = require('../utils/config').config;
var log = require('../utils/log').logger;
var mssql = require('../utils/mssql');

var dbType = config.dbType;
var pool = mysql.createPool(config.db.mysql);

function query(sql){
    if(dbType == 'mysql'){
        return meQuery(sql);
    }else if(dbType == 'sqlServer'){
        return mssql.query(sql);
    }
}
function meQuery(sql) {
    return new Promise((resolve, reject) => {
        pool.getConnection(function (err, connection) {
            if (err) {
                console.log(err);
            }
            connection.query(sql, [], (err, rows) => {
                if (err) {
                    log.info('异常SQL：',sql);
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