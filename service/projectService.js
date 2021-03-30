const log = require('../utils/log').logger;
const mysql = require('../utils/mysql');
const redis = require('../utils/redis');


const initData = async (req, res) => {
    try {
        const sql = `select * from project where deleteFlag = 0`;
        const records = await mysql.query(sql);
        let record = records && records[0];
        res.json({
            code: 0,
            data: record
        })
    } catch (error) {
        log.info(error);
        res.json({
            code: 1,
            data: {}
        })
    };
}

const refreshData = async () => {
    const sql = `select * from project where deleteFlag = 0`;
    const records = await mysql.query(sql);
    const record = records && records[0];
    const key = "API_BASIC_INFO";
    let dbInfo = {};
    let dbType = record.kind == 1 ? 'mysql' : 'sqlServer';
    let info = {}, obj = {};
    obj.host = record.host;
    obj.user = record.user;
    obj.password = record.password;
    if (record.kind == 1) obj.port = record.port;
    obj.database = record.database_;
    info[dbType] = obj;
    dbInfo.dbType = dbType;
    dbInfo.info = info;
    redis.hset(key, 'dbInfo', JSON.stringify(dbInfo));
    redis.hset(key, "name", record.name);
    redis.hset(key, "path", record.path);
    redis.hset(key, 'url', record.url);
    redis.hset(key, 'authToken', record.authToken);
    console.log('基本信息缓存完毕');
}


module.exports = {
    initData: initData,
    refreshData: refreshData
};