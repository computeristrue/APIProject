const log = require('../utils/log').logger;
const redis = require('../utils/redis');
const mysql = require('../utils/mysql');
const baseSql = require('../utils/baseSql');

const refreshData = async () => {
    var sql = `select id,dataId from dataDict where deleteFlag = 0`;
    const records = await mysql.query(sql);
    for (let i = 0; i < records.length; i++) {
        const record = records[i];
        const dbInfo = JSON.parse(await redis.hget("API_BASIC_INFO", 'dbInfo'));
        const sql2 = `select item.encode,item.text,item.three_part_code,item.item_id from t_data_dict_item item
         left join t_data_dict data on item.dict_id = data.id where data.data_id = ${record.dataId}`;
        let itemInfo = await baseSql.query(dbInfo, sql2);
        itemInfo = JSON.stringify(itemInfo, (key, val) => {
            if (!val) {
                val = "";
            }
            return val;
        });
        redis.hset("API_DATA_DICT", record.dataId, itemInfo);
    }
    console.log('数据字典配置缓存完毕');
}


module.exports = {
    refreshData: refreshData
}