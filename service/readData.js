const log = require('../utils/log').logger;
const redis = require('../utils/redis');
const sf = require('../utils/sqlFactory');
const baseSql = require('../utils/baseSql');
const doAxios = require('../utils/doAxios');
const dateUtils = require('../utils/dateUtils');
const mysql = require('../utils/mysql');

/**
 * 从数据库读取数据
 * @param {*} redis_key 
 * @param {*} read_db_id 
 * @param {*} id 
 * @returns 
 */
const readDB = async (redis_key, read_db_id, id) => {
    let result = [];
    try {
        const read_db_key = `API_DB_ID_${read_db_id}`;
        const read_db_info = await redis.get(read_db_key);
        const readIsMysql = read_db_info.dbType == 'mysql' ? true : false;
        const ft = JSON.parse(await redis.hget(redis_key, 'ft'));
        const tableName = await redis.hget(redis_key, 'table_name');
        let condition = await redis.hget(redis_key, 'condition') || "";
        if (id) {
            condition += ` and ${tableName}.id = ${id}`;
        }
        const timeField = await redis.hget(redis_key,'timeField');
        const timestamp_ = await redis.hget(redis_key,'timestamp_') || dateUtils.toString();
        if(timeField){
            condition += ` and ${timeField} >= '${timestamp_}'`;
        }
        const kind = Number(await redis.hget(redis_key, 'kind'));//推送还是拉取
        let isCRM = kind == 1 ? true : false;
        if (readIsMysql) {
            selectSql = sf.MYSQL(ft, tableName, condition, isCRM);
        } else {
            selectSql = sf.MSSQL(ft, tableName, condition, isCRM);
        }
        result = await baseSql.query(read_db_info, selectSql);
    } catch (error) {
        log.info(error);
    } finally {
        const moduleId = redis_key.replace('API_','');
        const kind = Number(await redis.hget(`API_${moduleId}`,'kind'));
        if(kind == 2){
            await writeDate(moduleId);
        }
        return result;
    };
}

const readAPI = async (redis_key, pull_api_id, id) => {
    let result = [];
    try {
        const API_CONFIG_ID = `API_CONFIG_ID_${pull_api_id}`;
        const r = await doAxios.do(API_CONFIG_ID);
        if(r.finallyData){
            result = r.finallyData;
        }
    } catch (error) {
        log.info(error);
    } finally {
        const moduleId = redis_key.replace('API_','');
        const kind = Number(await redis.hget(`API_${moduleId}`,'kind'));
        if(kind == 2){
            await writeDate(moduleId);
        }
        return result;
    };
}

/**
 * 写入读取时间
 * @param {*} moduleId 
 * @param {*} date 
 */
const writeDate = async (moduleId,date)=>{
    let timestamp_ = await redis.hget(`API_${moduleId}`,'timestamp_');
    date = dateUtils.toString(date);
    redis.hset(`API_${moduleId}`,'timestamp_',date);
    const sql = `update module set timestamp_ = '${date}' where moduleId = '${moduleId}'`;
    await mysql.query(sql);

}

module.exports = async (moduleId, id = null) => {
    let result = [];
    try {
        const redis_key = `API_${moduleId}`;
        const read_db_id = await redis.hget(redis_key, 'read_db_id');//读取数据库ID
        const pull_api_id = await redis.hget(redis_key, 'pull_api_id');//读取APIID
        if (read_db_id) {//读取数据库
            result = await readDB(redis_key, read_db_id, id);
        } else if (pull_api_id) {//读取API接口
            result = await readAPI(redis_key, pull_api_id, id);
        }
    } catch (error) {
        log.info(error);
    } finally {
        if(!(result.length > 0)){
            log.info(`${moduleId}_${id}未找到符合条件的数据`);
        }
        return result;
    };
}