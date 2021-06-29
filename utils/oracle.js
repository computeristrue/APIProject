const oracledb = require('oracledb');
const log = require('./log').logger;
const config = require('./config').config;
const libDir = config.libDir;
const is_win = config.is_win;


oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.autoCommit = true;

//window上需要这个，Linux上直接安装Oracle环境
if(is_win){
    try {
        oracledb.initOracleClient({ libDir: libDir });
    } catch (err) {
        console.error('Whoops!');
        console.error(err);
        process.exit(1);
    }
}

let connection;
let records = [];


const query = async (dbInfo,sql,data = []) => {
    try {
        connection = await oracledb.getConnection(dbInfo);
        records = await connection.execute(sql, data);
    } catch (error) {
        log.info(error);
        log.info('异常SQ：', sql);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (error) {
                log.info(error);
            };
        }
        return records.rows || records;
    };
}

module.exports = {
    query:query
}