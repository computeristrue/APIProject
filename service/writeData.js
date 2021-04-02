const log = require('../utils/log').logger;
const redis = require('../utils/redis');
const gSql = require('../utils/generateSql');
const baseSql = require('../utils/baseSql');
const apiLog = require('../utils/apiLog');
const doAxios = require('../utils/doAxios');

const writeDB = async (moduleId, redis_key, write_db_id, record, id, wyFieldName, ft) => {
    let syncResult = 0;
    try {
        const write_db_key = `API_DB_ID_${write_db_id}`;
        const write_db_info = await redis.get(write_db_key);
        const writeIsMysql = write_db_info.dbType == 'mysql' ? true : false;
        const targetTableName = await redis.hget(redis_key, 'target_table_name');
        if (wyFieldName) {//有唯一字段，进行更新，否则只新增
            var querySql = `select ${wyFieldName} from ${targetTableName} where ${wyFieldName} = '${record[wyFieldName]}'`;
            var updateSql = await gSql.update(moduleId, record, ft, targetTableName);
            var insertSql = await gSql.insert(moduleId, record, ft, targetTableName);
            if (writeIsMysql) {//mySql没找到一句话可以实现有则新增，无则修改的方法，所以需要先查询，然后判断
                let str = ""
                const re = await baseSql.query(write_db_info, querySql);
                if (re && re.length > 0) {
                    str = updateSql;
                } else {
                    str = insertSql;
                }
                if (str && str != "") {
                    try {
                        await baseSql.query(write_db_info, str);
                        syncResult = 1;
                    } catch (err) {
                        log.info(err);
                        syncResult = 2;
                    };
                }
            } else {//sql server一句话实现有则新增，无则修改，并将多个sql合并执行
                try {
                    let str = `if exists (${querySql}) ${updateSql} else ${insertSql}`;
                    await baseSql.query(write_db_info, str);
                    syncResult = 1;
                } catch (err) {
                    log.info(err);
                    syncResult = 2;
                };
            }
        } else {
            insertSql = await gSql.insert(moduleId, record, ft, targetTableName);
            if (insertSql != '') {
                try {
                    await baseSql.query(write_db_info, insertSql);
                    syncResult = 1;
                } catch (err) {
                    log.info(err);
                    syncResult = 2;
                };
            }
        }
    } catch (error) {
        log.info(error);
        syncResult = 2;
    } finally {
        //插入API日志
        let remark = wyFieldName ? record[wyFieldName] : '';
        await apiLog.insert(moduleId, id, `写入数据`, syncResult, JSON.stringify(record), '', remark);
        const kind = Number(await redis.hget(`API_${moduleId}`,'kind'));
        if (id && kind == 1) {//推送数据才回写同步状态
            try {
                const tableName = await redis.hget(redis_key, 'table_name');
                let dbInfo = await redis.hget('API_BASIC_INFO', 'dbInfo');
                dbInfo = JSON.parse(dbInfo);
                //有id的话，修改推送状态
                var syncSql = `update ${tableName} set sync_status = ${syncResult} where id = ${id}`;
                await baseSql.query(dbInfo, syncSql);
                log.info(`moduleId:${moduleId}_id:${id}同步状态修改成功`);
            } catch (error) {
                log.info(`moduleId:${moduleId}_id:${id}同步状态修改失败`);
                log.info(error);
            };
        }
        return syncResult;
    };
}

const writeAPI = async (moduleId, redis_key, send_api_id, record, id, wyFieldName, ft) => {
    let syncResult = 0;
    let msg = "";
    let subject = wyFieldName ? wyFieldName : '推送数据';
    try {
        const API_CONFIG_ID = `API_CONFIG_ID_${send_api_id}`;
        const keyVal = gSql.manageFieldValue(moduleId,record,ft);
        const r = await doAxios.do(API_CONFIG_ID, keyVal);
        syncResult = r.syncResult || 0;
        msg = r.finallyData || "";
        if (msg) msg = JSON.stringify(msg);
    } catch (error) {
        log.info(error);
    } finally {
        //插入API日志
        let remark = wyFieldName ? record[wyFieldName] : '';
        await apiLog.insert(moduleId, id, subject, syncResult, JSON.stringify(record), msg, remark);
        const kind = Number(await redis.hget(`API_${moduleId}`,'kind'));
        if (id && kind == 1) {//推送数据才回写同步状态
            try {
                const tableName = await redis.hget(redis_key, 'table_name');
                let dbInfo = await redis.hget('API_BASIC_INFO', 'dbInfo');
                dbInfo = JSON.parse(dbInfo);
                //有id的话，修改推送状态
                var syncSql = `update ${tableName} set sync_status = ${syncResult} where id = ${id}`;
                await baseSql.query(dbInfo, syncSql);
                log.info(`moduleId:${moduleId}_id:${id}同步状态修改成功`);
            } catch (error) {
                log.info(`moduleId:${moduleId}_id:${id}同步状态修改失败`);
                log.info(error);
            };
        }
        return syncResult;
    };
}

module.exports = async (moduleId, record, id = null) => {
    let syncResult = 0;
    try {
        const redis_key = `API_${moduleId}`;
        const write_db_id = await redis.hget(redis_key, 'write_db_id');
        const send_api_id = await redis.hget(redis_key, 'send_api_id');
        const ft = JSON.parse(await redis.hget(redis_key, 'ft'));
        for (let i = 0; i < ft.length; i++) {
            const item = ft[i];
            if (item.is_weiyi == 1) {
                wyFieldName = item.target_field;
            }
        }
        if (write_db_id) {
            syncResult = await writeDB(moduleId, redis_key, write_db_id, record, id, wyFieldName, ft);
        } else if (send_api_id) {
            syncResult = await writeAPI(moduleId, redis_key, send_api_id, record, id, wyFieldName, ft);
        }
    } catch (error) {
        log.info(error);
        syncResult = 2;
    } finally {
        return syncResult;
    };
}