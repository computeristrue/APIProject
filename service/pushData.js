const log = require('../utils/log').logger;
const redis = require('../utils/redis');
const sf = require('../utils/sqlFactory');
const baseSql = require('../utils/baseSql');


module.exports = async (moduleId, id = null) => {
    try {
        const redis_key = `API_${moduleId}`;
        const ft = JSON.parse(await redis.hget(redis_key, 'ft'));
        const tableName = await redis.hget(redis_key, 'table_name');
        let condition = await redis.hget(redis_key, 'condition') || "";//todo 在模块表中增加一个文本框，（使用读取数据库时）用于填写查询条件
        if (id) {
            condition += ` and ${tableName}.id = ${id}`;
        }
        const selectSql = sf.MYSQL(ft, tableName, condition);
        const read_db_id = await redis.hget(redis_key, 'read_db_id');
        const read_db_key = `API_DB_ID_${read_db_id}`;
        const read_db_info = await redis.get(read_db_key);
        const result = await baseSql.query(read_db_info, selectSql);
        console.log(result);
    } catch (error) {
        log.info(error);
    };
}