const config = require('./config').config;
const log = require('./log').logger;
const mysql = require('mysql');
const mssql = require('mssql');
const { sleep } = require('./baseUtils');
const oracle = require('./oracle');

async function mysqlQuery(info, sql, data) {
    let rows = [];
    let connection;
    try {
        const pool = mysql.createPool(info);
        connection = await getConnection(pool);
        if (connection) {
            rows = await mq(connection, sql, data);
        } else {
            log.info('获取连接失败');
        }
    } catch (error) {
        log.info(error);
    } finally {
        if (connection) {
            connection.destroy();//这个地方用release有问题，换成destroy
        }
        return rows;
    };
}

function getConnection(pool, num = 1) {
    if (num > 5) {
        return
    } else {
        return new Promise((resolve, reject) => {
            pool.getConnection((err, connection) => {
                if (err) {
                    log.info('MySql execute Error:' + JSON.stringify(err));
                    sleep(5000);
                    getConnection(pool, ++num);
                } else {
                    resolve(connection);
                }
            })
        })
    }
}

function mq(connection, sql, data) {
    return new Promise((resolve, reject) => {
        connection.query(sql, data, (err, rows) => {
            if (err) {
                log.info('异常SQL：', sql);
                log.info('MySql execute Error:' + JSON.stringify(err));
                reject(err);
            } else {
                resolve(rows);
            }
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
        queryViaStreamWithParams(info, SQL, null, {
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
function query(dbInfo, sql, data = []) {
    try {
        if (!dbInfo) {
            log.info('dbInfo is null!');
            return
        }
        var dbType = dbInfo.dbType;
        var info = dbInfo.info[dbType];
        if (dbType == 'mysql') {
            return mysqlQuery(info, sql, data)
        } else if (dbType == 'sqlServer') {//暂时先不支持参数吧，改动有点大
            return mssqlQuery(info, sql);
        } else if (dbType == 'oracle') {
            return oracle.query(info, sql, data);
        }
    } catch (error) {
        log.info(error);
    };
}

module.exports = {
    query: query,
    batchSave: mssqlBatchSave
};