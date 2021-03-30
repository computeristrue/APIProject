const redis = require('../utils/redis');
const log = require('../utils/log').logger;
const sf = require('../utils/sqlFactory');
const baseSql = require('../utils/baseSql');
const baseUtils = require('../utils/baseUtils');
const apiLog = require('../utils/apiLog');


module.exports = async (moduleId, id = null) => {
    try {
        const redis_key = `API_${moduleId}`;
        const ft = JSON.parse(await redis.hget(redis_key, 'ft'));
        let wyFieldName = "";
        for (let i = 0; i < ft.length; i++) {
            const item = ft[i];
            if (item.is_weiyi == 1) {
                wyFieldName = item.target_field;
            }
        }
        const tableName = await redis.hget(redis_key, 'table_name');
        const targetTableName = await redis.hget(redis_key, 'target_table_name');
        let condition = await redis.hget(redis_key, 'condition') || "";//todo 在模块表中增加一个文本框，（使用读取数据库时）用于填写查询条件
        if (id) {
            condition += ` and ${tableName}.id = ${id}`;
        }
        const selectSql = sf.MYSQL(ft, tableName, condition);
        const read_db_id = await redis.hget(redis_key, 'read_db_id');
        const read_db_key = `API_DB_ID_${read_db_id}`;
        const read_db_info = await redis.get(read_db_key);
        const write_db_id = await redis.hget(redis_key, 'write_db_id');
        const write_db_key = `API_DB_ID_${write_db_id}`;
        const write_db_info = await redis.get(write_db_key);
        const isMysql = write_db_info.dbType == 'mysql' ? true : false;
        const result = await baseSql.query(read_db_info, selectSql);
        let newArr = baseUtils.groupArray(result, 2000);
        for (let i = 0; i < newArr.length; i++) {
            const arr = newArr[i];
            for (let j = 0; j < arr.length; j++) {
                const record = arr[j];
                let syncResult = 0;
                if (wyFieldName) {//有唯一字段，进行更新，否则只新增
                    var querySql = `select ${wyFieldName} from ${targetTableName} where ${wyFieldName} = '${record[wyFieldName]}'`;
                    var updateSql = "";//todo 还有自动拼接SQL没做
                    var insertSql = "";
                    if (isMysql) {//mySql没找到一句话可以实现有则新增，无则修改的方法，所以需要先查询，然后判断
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
                    insertSql = "";//todo
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
                //插入API日志
                let remark = wyFieldName ? record[wyFieldName] : '';
                await apiLog.insert(moduleId, id, `推送数据`, syncResult, JSON.stringify(record), '', remark);
                if (id) {
                    //有id的话，修改推送状态
                    var syncSql = `update ${tableName} set sync_status = ${syncResult} where id = ${id}`;
                    await baseSql.query(read_db_info, syncSql);
                }
            }
        }
    } catch (error) {
        log.info(error);
    };
}