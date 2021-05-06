const log = require('../utils/log').logger;
const mysql = require('../utils/mysql');
const redis = require('../utils/redis');

const refreshData = async () => {
    const sql = `select u.*,m.moduleId from userField u left join module m on u.module_id = m.id where u.deleteFlag = 0 and m.deleteFlag = 0`;
    const records = await mysql.query(sql);
    let obj = {};
    for (let i = 0; i < records.length; i++) {
        const record = records[i];
        const moduleId = record.moduleId;
        await redis.hdel(`API_${moduleId}`,'ft');
        let info = {};
        for (const key in record) {
            if (Object.hasOwnProperty.call(record, key)) {
                const val = record[key];
                if (['deleteFlag', 'dateCreated', 'lastUpdated', 'id', 'project_id', 'module_id'].indexOf(key) < 0) {
                    info[key] = val;
                }
            }
        }
        if (obj[moduleId]) {
            let arr = obj[moduleId];
            arr.push(info);
            obj[moduleId] = arr;
        } else {
            let arr = [];
            arr.push(info);
            obj[moduleId] = arr;
        }
    }
    for (const moduleId in obj) {
        if (Object.hasOwnProperty.call(obj, moduleId)) {
            const info = obj[moduleId];
            redis.hset(`API_${moduleId}`, 'ft', JSON.stringify(info));
        }
    }
    console.log("字段配置缓存完毕");
}



module.exports = {
    refreshData: refreshData
};