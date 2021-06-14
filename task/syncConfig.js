const log = require('../utils/log').logger;
const mysql = require('../utils/baseSql');
const moment = require('moment');
const models = require('../model');
const baseService = require('../service/baseService');
const Op = require('sequelize').Op;

/**
 * 将原有的配置信息转义到新的数据库里面
 */

/**
 * 原数据库
 */
const oldDb = {
    "dbType": "mysql",
    "info": {
        "mysql": {
            "host": "127.0.0.1",
            "user": "upcrm",
            "password": "upcrm!@#",
            "port": "3306",
            "database": "api"
        }
    }
};
/**
 * 新数据库
 */
 const newDb = {
    "dbType": "mysql",
    "info": {
        "mysql": {
            "host": "127.0.0.1",
            "user": "upcrm",
            "password": "upcrm!@#",
            "port": "3306",
            "database": "wbwy"
        }
    }
};

const begin = async () => {
    console.log('开始同步配置信息');
    await project();
    await dbConfig();
    await apiConfig();
    await moduleTable();
    await userField();
    console.log('配置信息转移完成');
}

const project = async () => {
    const sql = `select * from project where deleteFlag = 0`;
    const oldRecords = await mysql.query(oldDb, sql);
    if (oldRecords && oldRecords.length > 0) {
        let record = oldRecords[0];
        delete record.id;
        delete record.deleteFlag;
        delete record.dateCreated;
        delete record.lastUpdated;
        const domain = models.Project;
        const pro = await domain.findAll();
        if (!pro || pro.length < 1) {
            await domain.create(record);
        }
    }
    console.log('Project表转移完毕');
}

const dbConfig = async () => {
    const sql = `select * from dbconfig where deleteFlag = 0`;
    const oldRecords = await mysql.query(oldDb, sql);
    if (oldRecords && oldRecords.length > 0) {
        for (let i = 0; i < oldRecords.length; i++) {
            let record = oldRecords[i];
            delete record.id;
            delete record.deleteFlag;
            delete record.dateCreated;
            delete record.lastUpdated;
            const domain = models.Db_config;
            const dbcfg = await domain.findOne({ where: { name: record.name } });
            if (dbcfg) {
            } else {
                await domain.create(record);
            }
        }
    }
    console.log('dbConfig表转移完毕');
}

const apiConfig = async () => {
    const sql = `select * from apiconfig where deleteFlag = 0`;
    const oldRecords = await mysql.query(oldDb, sql);
    if (oldRecords && oldRecords.length > 0) {
        for (let i = 0; i < oldRecords.length; i++) {
            let record = oldRecords[i];
            delete record.id;
            delete record.deleteFlag;
            delete record.dateCreated;
            delete record.lastUpdated;
            const domain = models.Api_config;
            const apicfg = await domain.findOne({ where: { name: record.name } });
            if (apicfg) {
            } else {
                await domain.create(record);
            }
        }
    }
    console.log('apiConfig表转移完毕');
}

const moduleTable = async () => {
    const sql = `select * from module where deleteFlag = 0`;
    const oldRecords = await mysql.query(oldDb, sql);
    const domain = models.Module;
    if (oldRecords && oldRecords.length > 0) {
        for (let i = 0; i < oldRecords.length; i++) {
            const record = oldRecords[i];
            delete record.id;
            delete record.deleteFlag;
            delete record.dateCreated;
            delete record.lastUpdated;
            delete record.parent_module_id;
            delete record.read_db_id;
            delete record.write_db_id;
            delete record.pull_api_id;
            delete record.send_api_id;
            const mRecord = await domain.findOne({ where: { name: record.name } });
            if (mRecord) {
            } else {
                await domain.create(record);
            }
        }
    }
    const reSql = `select m.id,m.name mName,parent.name pName,read_db.name readName,write_db.name writeName,pull_api.name pullName,send_api.name sendName from module m 
                    left join module parent on m.parent_module_id = parent.id left join dbconfig read_db on m.read_db_id = read_db.id 
                    left join dbconfig write_db on m.write_db_id = write_db.id left join apiconfig pull_api on m.pull_api_id = pull_api.id 
                    left join apiconfig send_api on m.send_api_id = send_api.id where m.deleteFlag = 0`;
    const reRecord = await mysql.query(oldDb, reSql);
    let m = await baseService.getIdAndName('Module');
    let d = await baseService.getIdAndName('Db_config');
    let a = await baseService.getIdAndName('Api_config');
    for (let i = 0; i < reRecord.length; i++) {
        const re = reRecord[i];
        let kv = {};
        if (re.pName) {
            kv.parent_module_id = getFindKey(re.pName, m)
        }
        if (re.readName) {
            kv.read_db_id = getFindKey(re.readName, d);
        }
        if (re.writeName) {
            kv.write_db_id = getFindKey(re.writeName, d);
        }
        if (re.pullName) {
            kv.pull_api_id = getFindKey(re.pullName, a);
        }
        if (re.sendName) {
            kv.send_api_id = getFindKey(re.sendName, a);
        }
        await domain.update(kv, { where: { name: re.mName } });
    }
    console.log('module表转移完毕');
}

const userField = async () => {
    const sql = `select uf.*,m.name mName from userfield uf left join module m on uf.module_id = m.id where uf.deleteFlag = 0`;
    const oldRecords = await mysql.query(oldDb, sql);
    const domain = models.User_field;
    for (let i = 0; i < oldRecords.length; i++) {
        const record = oldRecords[i];
        delete record.id;
        delete record.deleteFlag;
        delete record.dateCreated;
        delete record.lastUpdated;
        const newUfSql = `select uf.id from api_user_field uf left join api_module m on uf.module_id = m.id where uf.date_deleted is null and m.name = '${record.mName}' and uf.target_field = '${record.target_field}'`;
        const ufRecord = await mysql.query(newDb,newUfSql);
        if(ufRecord && ufRecord.length > 0){
        }else{
            record.module_id = 1;
            record.is_detail = record.is_detail ? 1 : 2;
            delete record.mName;
            await domain.create(record);
        }
    }
    const reSql = `select uf.id,m.name,uf.target_field,uf.origin_field from userfield uf left join module m on uf.module_id = m.id where uf.deleteFlag = 0`;
    const reRecord = await mysql.query(oldDb,reSql);
    let m = await baseService.getIdAndName('Module');
    for (let i = 0; i < reRecord.length; i++) {
        const re = reRecord[i];
        let kv = {};
        if(re.name){
            kv.module_id = getFindKey(re.name,m);
        }
        await domain.update(kv, { where: { target_field: re.target_field,origin_field:re.origin_field } });
    }
    console.log('userfield表转移完毕');
}

// 根据对象的value值获取key
const getFindKey = (value, obj, me) => {
    let objlist = JSON.parse(JSON.stringify(obj));
    delete objlist.me;
    let findKey = (value, compare = (a, b) => a === b) => {
        return Object.keys(objlist).find(k => compare(objlist[k], value))
    }
    return findKey(value);
}

begin();

module.exports = {
    begin: begin
}