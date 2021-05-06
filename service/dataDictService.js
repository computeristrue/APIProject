const log = require('../utils/log').logger;
const redis = require('../utils/redis');
const mysql = require('../utils/mysql');
const baseSql = require('../utils/baseSql');

const refreshData = async () => {
    var sql = `select dict_id dataId from userField where deleteFlag = 0 and dict_id is not null`;
    const records = await mysql.query(sql);
    await redis.del(`API_DATA_DICT`);
    for (let i = 0; i < records.length; i++) {
        const record = records[i];
        const dbInfo = JSON.parse(await redis.hget("API_BASIC_INFO", 'dbInfo'));
        const sql2 = `select item.encode,item.text,item.three_part_code,item.item_id from t_data_dict_item item
         left join t_data_dict data on item.dict_id = data.id where data.id = ${record.dataId}`;
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

const getDict = async (req,res)=>{
    let re = [];
    try{
        const user_id = await redis.hget('API_BASIC_INFO','user_id');
        const dbInfo = JSON.parse(await redis.hget("API_BASIC_INFO", 'dbInfo'));
        const sql = `select id,text from t_data_dict where user_id = ${user_id}`;
        re = await baseSql.query(dbInfo, sql);
        for (let i = 0; i < re.length; i++) {
            const record = re[i];
            redis.hset('API_DATA_DICT_TEXT',record.id,record.text);
        }
    }catch(error){
        log.info(error);
    }finally{
        res.json({
            arr:re
        })
    };
}

module.exports = {
    refreshData: refreshData,
    getDict:getDict
}