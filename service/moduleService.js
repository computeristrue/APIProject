const log = require('../utils/log').logger;
const redis = require('../utils/redis');
const mysql = require('../utils/mysql');

refreshData = async () => {
    const sql = `select * from module where deleteFlag = 0`;
    const records = await mysql.query(sql);
    for (let i = 0; i < records.length; i++) {
        const record = records[i];
        const moduleId = record.moduleId;
        for (const key in record) {
            if (Object.hasOwnProperty.call(record, key)) {
                let val = record[key];
                if(!val) val = "";
                if (['deleteFlag', 'dateCreated', 'lastUpdated'].indexOf(key) < 0) {
                    redis.hset(`API_${moduleId}`, key, val);
                }
            }
        }
    }
}

module.exports = {
    refreshData: refreshData
}