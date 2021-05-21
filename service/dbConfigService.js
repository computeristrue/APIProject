const log = require('../utils/log').logger;
const redis = require('../utils/redis');
const mysql = require('../utils/mysql');

const refreshData = async () => {
    const sql = `select * from dbConfig where deleteFlag = 0`;
    const records = await mysql.query(sql);
    for (let i = 0; i < records.length; i++) {
        const record = records[i];
        const id = record.id;
        await redis.del(`API_DB_ID_${id}`);
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
        redis.set(`API_DB_ID_${id}`, json);
    }
    console.log("数据库配置缓存完毕");
}

module.exports = {
    refreshData: refreshData
}