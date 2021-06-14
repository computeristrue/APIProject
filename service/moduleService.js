const log = require('../utils/log').logger;
const redis = require('../utils/redis');
const mysql = require('../utils/mysql');
const models = require('../model');

const refreshData = async () => {
    const domain = models.Module;
    const records = await domain.findAll();
    for (let i = 0; i < records.length; i++) {
        const record = records[i];
        const moduleId = record.moduleId;
        for (const key in record) {
            if (Object.hasOwnProperty.call(record, key)) {
                let val = record[key];
                if(!val) val = "";
                if (['deleteFlag', 'dateCreated', 'lastUpdated'].indexOf(key) < 0) {
                    await redis.hdel(`API_${moduleId}`,key);
                    await redis.hset(`API_${moduleId}`, key, val);
                }
            }
        }
    }
    console.log(`模块配置信息缓存完毕`);
}

const getModule = async(req,res)=>{
    let re = [];
    try{
        const domain = models.Module;
        re = await domain.findAll();
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
    getModule:getModule
}