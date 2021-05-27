const log = require('../utils/log').logger;
const mysql = require('../utils/mysql');
const redis = require('../utils/redis');
const moment = require('moment');
const dateUtils = require('../utils/dateUtils');

const initData = async (req, res) => {
    try {
        const sql = `select * from project where deleteFlag = 0`;
        const records = await mysql.query(sql);
        let record = records && records[0];
        res.json({
            code: 0,
            data: record
        })
    } catch (error) {
        log.info(error);
        res.json({
            code: 1,
            data: {}
        })
    };
}

const saveBasicDB = async()=>{
    try{
      let dbInfo = await redis.hget('API_BASIC_INFO','dbInfo');
      dbInfo = JSON.parse(dbInfo);
      let obj = {};
      const dbType = dbInfo.dbType;
      obj = dbInfo.info[dbType];
      obj.name = 'CRM基础DB配置';
      obj.remark = 'CRM基础DB配置';
      if(dbInfo.dbType == 'mysql'){
          obj.kind = 1;
      }else if(dbInfo.dbType == 'sqlServer'){
          obj.kind = 2;
      }
      obj.kind = dbInfo.dbType == 'mysql' ? 1 : 2;
      obj.isBasic = 1;
      obj.dateCreated = dateUtils.toString();
      obj.lastUpdated = dateUtils.toString();
      let fieldArr = [],valueArr = [],str = '';
      for (let key in obj) {
          if (Object.hasOwnProperty.call(obj, key)) {
              let val = obj[key];
              if(key == 'database'){
                  key = 'database_';
              }
              val = `'${val}'`;
              fieldArr.push(key);
              valueArr.push(val);
              str += `${key} = ${val},`;
          }
      }
      if(str.endsWith(',')){
        str = str.substring(0, str.length - 1);
      }
      const selectSql = `select id from dbConfig where isBasic = 1 and deleteFlag = 0`;
      const insertSql = `insert into dbConfig(${fieldArr.join(',')}) values(${valueArr.join(',')})`;
      const updateSql = `update dbConfig set ${str} where isBasic = 1 and deleteFlag = 0`;
      const r1 = await mysql.query(selectSql);
      if(r1 && r1.length > 0){
          await mysql.query(updateSql);
      }else{
          await mysql.query(insertSql);
      }
    }catch(error){
        log.info(error);
    };
}

const refreshData = async () => {
    const sql = `select * from project where deleteFlag = 0`;
    const records = await mysql.query(sql);
    const record = records && records[0];
    const key = "API_BASIC_INFO";
    await redis.del(key);
    let dbInfo = {};
    let dbType = record.kind == 1 ? 'mysql' : 'sqlServer';
    let info = {}, obj = {};
    obj.host = record.host;
    obj.user = record.user;
    obj.password = record.password;
    if (record.kind == 1) obj.port = record.port;
    obj.database = record.database_;
    info[dbType] = obj;
    dbInfo.dbType = dbType;
    dbInfo.info = info;
    await redis.hset(key, 'dbInfo', JSON.stringify(dbInfo));
    await redis.hset(key, "name", record.name);
    await redis.hset(key, "path", record.path);
    await redis.hset(key, 'url', record.url);
    await redis.hset(key, 'authToken', record.authToken);
    await redis.hset(key, 'user_id', record.user_id);
    console.log('基本信息缓存完毕');
    await saveBasicDB();//更新dbConfig中的那个默认配置
}


module.exports = {
    initData: initData,
    refreshData: refreshData
};