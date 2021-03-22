const config = require('./config').config;
const log = require('./log').logger;
const mysql = require('mysql');
const mssql = require('mssql');

function mysqlQuery(info, sql) {
    const pool = mysql.createPool(info);
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) {
                log.info(err);
            }
            connection.query(sql, [], (err, rows) => {
                if (err) {
                    log.info('异常SQL：', sql);
                    log.info('MySql execute Error:' + JSON.stringify(err));
                    reject(err);
                    return
                }
                resolve(rows);
                connection.release();
            })
        })
    })
}

function mssqlQuery(info, sql) {
    info['connectionTimeout'] = 300000;
    info['requestTimeout'] = 300000;
    info['stream'] = false;
    info['options'] = {
        encrypt: false //Use this if you're on Windows Azure
    };
    info['pool'] = {
        min: 0,
        max: 400,
        idleTimeoutMillis: 3000
    };
    return new Promise((resolve, reject) => {
        mssql.connect(info).then(pool => {
            return pool.query(sql);
        }).then(re => {
            resolve(re ? re.recordset : []);
        }).catch(e => {
            console.log(`异常SQL`, sql);
            reject(e);
        })
    });
}

function mssqlBatchSave(info, SQL) {
    return new Promise((resolve, reject) => {
        sql.queryViaStream(info, SQL, null, {
            error: function (err) {
                reject(err);
            },
            columns: function (columns) {
            },
            row: function (row) {
            },
            done: function (affected) {
                resolve(affected);
            }
        })
    })
}

function queryViaStreamWithParams(info, SQL, params, func) {
    info.stream = true;
    info['connectionTimeout'] = 300000;
    info['requestTimeout'] = 300000;
    info['stream'] = false;
    info['options'] = {
        encrypt: false //Use this if you're on Windows Azure
    };
    info['pool'] = {
        min: 0,
        max: 400,
        idleTimeoutMillis: 3000
    };
    try {
        mssql.connect(info, (err) => {
            if (err) {
                log.info(err);
            } else {
                var request = new mssql.Request();
                request.stream = true;
                if (params) {
                    for (let index in params) {
                        request.input(index, params[index].sqlType, params[index].inputValue);
                    }
                }
                request.query(SQL);
                request.on('recordset', function (columns) {
                    func.columns(columns);
                });
                request.on('row', function (row) {
                    func.row(row);
                });
                request.on('error', function (err) {
                    func.error(err);
                });
                request.on('done', function (affected) {
                    func.done(affected);
                });
            }
        })
        mssql.on('error', func.error);
    } catch (error) {
        log.info(error);
        func.error(error);
    } finally {
        info.stream = false;
    };
}


/**
 * 根据配置信息匹配相应的SQL模块并执行
 * @param {配置文件中的数据库连接信息} dbInfo 
 * @param {要执行的SQL语句} sql 
 */
function query(dbInfo, sql) {
    try {
        if (!dbInfo) {
            log.info('dbInfo is null!');
        }
        var dbType = dbInfo.dbType;
        var info = dbInfo.info[dbType];
        if (dbType == 'mysql') {
            return mysqlQuery(info, sql)
        } else if (dbType == 'sqlServer') {
            return mssqlQuery(info, sql);
        }
    } catch (error) {
        log.info(error);
    };
}

module.exports = {
    query: query,
    batchSave: mssqlBatchSave
};