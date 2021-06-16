const log = require('../utils/log').logger;
const redis = require('../utils/redis');
const sf = require('../utils/sqlFactory');
const baseSql = require('../utils/baseSql');
const doAxios = require('../utils/doAxios');
const dateUtils = require('../utils/dateUtils');
const mysql = require('../utils/mysql');
const moment = require('moment');
const gSql = require('../utils/generateSql');
const models = require('../model');

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
        const timeField = await redis.hget(redis_key, 'timeField');
        const timestamp_ = await redis.hget(redis_key, 'timestamp_') || dateUtils.toString();
        if (timeField) {
            condition += ` and ${timeField} >= '${timestamp_}'`;
        }
        const kind = Number(await redis.hget(redis_key, 'kind'));//推送还是拉取
        let isCRM = kind == 1 ? true : false;
        let selectSql = "";
        if (readIsMysql) {
            selectSql = sf.MYSQL(ft, tableName, condition, isCRM);
        } else {
            selectSql = sf.MSSQL(ft, tableName, condition, isCRM);
        }
        result = await baseSql.query(read_db_info, selectSql);
        if (kind == 1) {//推送的时候才会查询带有明细的模块
            const moduleId = redis_key.replace('API_', '');
            result = await readDetail(moduleId, ft, result);
        }
    } catch (error) {
        log.info(error);
    } finally {
        const moduleId = redis_key.replace('API_', '');
        const kind = Number(await redis.hget(`API_${moduleId}`, 'kind'));
        if (kind == 2) {
            await writeDate(moduleId);
        }
        return result;
    };
}

const readAPI = async (redis_key, pull_api_id, id) => {
    let result = [];
    try {
        const API_CONFIG_ID = `API_CONFIG_ID_${pull_api_id}`;
        const r = await doAxios.do(API_CONFIG_ID, null, redis_key,null);
        if (r.finallyData) {
            result = r.finallyData;
        }
    } catch (error) {
        log.info(error);
    } finally {
        const moduleId = redis_key.replace('API_', '');
        const kind = Number(await redis.hget(`API_${moduleId}`, 'kind'));
        if (kind == 2) {
            await writeDate(redis_key, moduleId);
        }
        return result;
    };
}

/**
 * 写入读取时间
 * @param {*} moduleId 
 * @param {*} date 
 */
const writeDate = async (moduleId, date) => {
    date = dateUtils.toString(date);
    redis.hset(`API_${moduleId}`, 'timestamp_', date);
    const sql = `update module set timestamp_ = '${date}' where moduleId = '${moduleId}'`;
    await mysql.query(sql);
}

/**
 * 读取明细
 * @param {*} moduleId 
 * @param {*} records 
 */
const readDetail = async (moduleId, mainFt, records) => {
    try {
        let detailName = "";
        for (let i = 0; i < mainFt.length; i++) {
            const item = mainFt[i];
            if (item.is_detail == 1) {
                detailName = item.target_field;
            }
        }
        detailName = detailName ? detailName : 'detail';
        const domain = models.Module;
        const pRecord = await domain.findOne({ where: { moduleId: moduleId } });
        let r;
        if (pRecord) {
            r = await domain.findAll({ where: { parent_module_id: pRecord.id } });
        }
        if (r && r.length > 0) {
            const childModuleId = r[0].moduleId;
            for (let i = 0; i < records.length; i++) {
                let record = records[i];
                const mainId = record.id;
                const redis_key = `API_${childModuleId}`;
                const read_db_id = await redis.hget(redis_key, 'read_db_id');//读取数据库ID
                const read_db_key = `API_DB_ID_${read_db_id}`;
                const read_db_info = await redis.get(read_db_key);
                const readIsMysql = read_db_info.dbType == 'mysql' ? true : false;
                const ft = JSON.parse(await redis.hget(redis_key, 'ft'));
                const tableName = await redis.hget(redis_key, 'table_name');
                let condition = ` and ${tableName}.${moduleId}_id = ${mainId}`;
                const timeField = await redis.hget(redis_key, 'timeField');
                const timestamp_ = await redis.hget(redis_key, 'timestamp_') || dateUtils.toString();
                if (timeField) {
                    condition += ` and ${timeField} >= '${timestamp_}'`;
                }
                let selectSql = "";
                if (readIsMysql) {
                    selectSql = sf.MYSQL(ft, tableName, condition);
                } else {
                    selectSql = sf.MSSQL(ft, tableName, condition);
                }
                let detail = [];
                const r2 = await baseSql.query(read_db_info, selectSql);
                for (let j = 0; j < r2.length; j++) {
                    let item = r2[j];
                    let keyVal = (await gSql.manageFieldValue(moduleId, item, ft, tableName)).keyVal;
                    let obj = {};
                    for (const key in keyVal) {
                        if (Object.hasOwnProperty.call(keyVal, key)) {
                            let val = keyVal[key];
                            if (val) {
                                if (typeof val != 'object') {
                                    val = val.toString();
                                    if (val.startsWith(`'`) && val.endsWith(`'`)) {
                                        val = val.substring(1, val.length - 1);
                                    }
                                }
                            }
                            if (val == 'null') {
                                val = "";
                            }
                            obj[key] = val;
                        }
                    }
                    detail.push(obj);
                }
                record[detailName] = detail;
            }
        }
    } catch (error) {
        log.info(error);
    } finally {
        return records;
    };
}

// /**
//  * 根据moduleId对应的字段配置去格式化数据
//  * @param {*} moduleId 
//  * @param {*} records 
//  */
// const parseData = async (moduleId,records)=>{
//     try{
//         const ft = JSON.parse(await redis.hget(`API_${moduleId}`, 'ft'));
//         let info = {};
//         for (let i = 0; i < ft.length; i++) {
//             const item = ft[i];
//             info[item.target_field] = item;
//         }
//     for (let i = 0; i < records.length; i++) {
//         let record = records[i];
//         for (const key in record) {
//             if (Object.hasOwnProperty.call(record, key)) {
//                 let val = record[key];
//                 const item = info[key];
//                 if(item){
//                     if(item.is_date == 1){
//                         let sdf = item.sdf || 'YYYY-MM-DD';
//                         val = val ? moment(val).format(sdf) : '';
//                     }
//                     if(item.is_double == 1){
//                         let decimal_place = item.decimal_place || 2;
//                         val = val ? val.toFixed(decimal_place) : 0;
//                     }
//                     record[key] = val;
//                 }
//             }
//         }
//     }
//     }catch(error){
//         log.info(error);
//     }finally{
//         return records;
//     };
// }

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
        if (!(result.length > 0)) {
            log.info(`${moduleId}_${id}未找到符合条件的数据`);
        }
        return result;
    };
}