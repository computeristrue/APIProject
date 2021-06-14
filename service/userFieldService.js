const log = require('../utils/log').logger;
const mysql = require('../utils/mysql');
const redis = require('../utils/redis');
const dataDictService = require('../service/dataDictService');
const models = require('../model');

const refreshData = async () => {
    const userField = models.User_field;
    const module = models.Module;
    const records = await userField.findAll();
    let obj = {};
    for (let i = 0; i < records.length; i++) {
        const record = records[i];
        const moduleRecord = await module.findOne({where:{id:record.module_id}});
        const moduleId = moduleRecord.moduleId;
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
            await redis.hdel(`API_${moduleId}`,'ft');
            await redis.hset(`API_${moduleId}`, 'ft', JSON.stringify(info));
        }
    }
    console.log("字段配置缓存完毕");
    dataDictService.refreshData();
}



module.exports = {
    refreshData: refreshData
};