const log = require('../utils/log').logger;
const redis = require('../utils/redis');
const mysql = require('../utils/mysql');
const models = require('../model');

const refreshData = async () => {
    const domain = models.Db_config;
    const records = await domain.findAll();
    for (let i = 0; i < records.length; i++) {
        const record = records[i];
        const id = record.id;
        let json = {};
        let info = {};
        let obj = {};
        let kindText;
        if (record.kind == 1) {
            kindText = 'mysql';
            obj.port = record.port;
        } else if (record.kind == 2) {
            kindText = 'sqlServer';
        } else if (record.kind == 3) {
            kindText = 'oracle';
        }
        json.dbType = kindText;
        const proArr = ['host', 'user', 'password', 'database_'];
        for (const index in proArr) {
            let key = proArr[index];
            let val = record[key];
            if (!val) val = "";
            if (key == 'database_') key = 'database';
            if (key == 'host' && kindText == 'sqlServer') key = 'server';
            if (key == 'host' && kindText == 'oracle') key = 'connectString'
            obj[key] = val;
        }
        info[kindText] = obj;
        json.info = info;
        await redis.del(`API_DB_ID_${id}`);
        await redis.set(`API_DB_ID_${id}`, json);
    }
    console.log("数据库配置缓存完毕");
}

module.exports = {
    refreshData: refreshData
}