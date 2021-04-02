const log = require('../utils/log').logger;
const redis = require('../utils/redis');
const mysql = require('../utils/mysql');

const refreshData = async () => {
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
    console.log(`模块配置信息缓存完毕`);
}

const getModule = async(req,res)=>{
    let re = [];
    try{
        const sql = `select id,name from module where deleteFlag = 0`;
        re = await mysql.query(sql);
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