const log = require('../utils/log').logger;
const redis = require('../utils/redis');
const mysql = require('../utils/mysql');
const models = require('../model');

const refreshData = async () => {
    const domain = models.Api_config;
    const re = await domain.findAll();
    for (let i = 0; i < re.length; i++) {
        const record = re[i];
        for (const key in record) {
            if (Object.hasOwnProperty.call(record, key)) {
                let val = record[key];
                if (!val) val = "";
                if (['deleteFlag', 'dateCreated', 'lastUpdated'].indexOf(key) < 0) {
                    await redis.hdel(`API_CONFIG_ID_${record.id}`, key);
                    await redis.hset(`API_CONFIG_ID_${record.id}`, key, val);
                }
            }
        }
    }
    console.log(`API配置信息缓存完毕`);
}

module.exports = {
    refreshData: refreshData
}