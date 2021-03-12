var fs = require('fs');
var stat = fs.statSync
var log = require('../utils/log').logger;
var moment = require('moment');
var mysql = require('../utils/mysql');
var path = require('path');


var pService = {};



// /**
//  * 根据项目ID替换目标路径下的config.json文件
//  * @param {目标路径} dst 
//  * @param {项目ID} project_id 
//  */
// pcon.reJson = async function (dst, project_id) {
//     var json = JSON.parse(fs.readFileSync(`${dst}/config.json`));
//     var pm2ConfigPath = `${dst}/ecosystem.config.js`;
//     var pm2ConfigContext = fs.readFileSync(pm2ConfigPath,'utf-8');
//     var sql1 = `select * from project where deleteFlag = 0 and id = ${project_id}`;
//     var sql2 = `select * from dbConfig where deleteFlag = 0 and project_id = ${project_id}`;
//     var sql3 = `select * from apiConfig where deleteFlag = 0 and project_id = ${project_id}`;
//     var sql4 = `select * from module where deleteFlag = 0 and project_id = ${project_id}`;
//     return await Promise.all([mysql.query(sql1), mysql.query(sql2), mysql.query(sql3), mysql.query(sql4)]).then(re => {
//         var re1 = re[0], re2 = re[1], re3 = re[2], re4 = re[3];
//         if (re1 && re1.length > 0) {
//             var item = re1[0];
//             var CUSTOM_DB_TYPE = item.kind == 1 ? 'mysql' : 'sqlServer';
//             var CUSTOM_DB_CONFIG = {};
//             CUSTOM_DB_CONFIG[CUSTOM_DB_TYPE] = {
//                 "host": item.host,
//                 "user": item.user,
//                 "password": item.password,
//                 "database": item.database_
//             };
//             if(CUSTOM_DB_TYPE == 'mysql')CUSTOM_DB_CONFIG[CUSTOM_DB_TYPE]['port'] = item.port;
//             json.db.crm.dbType = CUSTOM_DB_TYPE;
//             json.db.crm.info = CUSTOM_DB_CONFIG;
//             json.api.crm = {
//                 "host": item.url,
//                 "authToken": item.authToken,
//                 "api_log": "apiLog/insert",
//             };
//             json.CUSTOM_PORT = item.listener_port;
//             //PM2配置文件
//             var CUSTOM_PROJECT = item.name;
//             var CUSTOM_ERR_LOG = path.join(item.path,`${item.name}_err.log`);
//             var CUSTOM_OUT_LOG = path.join(item.path,`${item.name}_out.log`);
//             pm2ConfigContext = pm2ConfigContext.replace('CUSTOM_PROJECT',CUSTOM_PROJECT).replace('CUSTOM_ERR_LOG',CUSTOM_ERR_LOG).replace('CUSTOM_OUT_LOG',CUSTOM_OUT_LOG);
//             fs.writeFileSync(pm2ConfigPath,pm2ConfigContext,'utf-8');
//         }
//         var dbObj = {},apiObj = {};
//         for(var i = 0;i<re2.length;i++){
//             var record = re2[i];
//             var dbType = record.kind == 1 ? 'mysql' : 'sqlServer';
//             var info = {};
//             info[dbType] = {
//                 "host": record.host,
//                 "user": record.user,
//                 "password": record.password,
//                 "database": record.database_
//             }
//             if(dbType == 'mysql')info[dbType]['port'] = record.port;
//             json.db[record.name] = {
//                 "dbType":dbType,
//                 "info":info
//             }
//             dbObj[record.id] = record.name;
//         }
//         for(var i = 0;i<re3.length;i++){
//             var record = re3[i];
//             json.api[record.name] = {
//                 url:record.url,
//                 method:record.method == 1 ? 'post' : 'get',
//                 type:record.type == 1 ? 'json' : 'xml'
//             };
//             apiObj[record.id] = record.name;
//         }
//         for(var i =0;i<re4.length;i++){
//             var record = re4[i];
//             var moduleId = record.moduleId,name = record.name;
//             var kind = record.kind == 1 ? 'push' : 'pull';
//             json.module[moduleId] = {
//                 name:name,
//                 kind:kind,
//                 table_name:record.table_name,
//                 read_db:dbObj[record.read_db_id] ? dbObj[record.read_db_id] : '',
//                 write_db:dbObj[record.write_db_id] ? dbObj[record.write_db_id] : '',
//                 pull_api:apiObj[record.pull_api_id] ? apiObj[record.pull_api_id] : '',
//                 send_api:apiObj[record.send_api_id] ? apiObj[record.send_api_id] : '',
//                 polling_mode:record.polling_mode == 1 ? 'Interval' : 'schedule',
//                 interval_:record.interval_
//             }
//         }
//         fs.writeFileSync(`${dst}/config.json`, JSON.stringify(json));
//         return '配置文件替换完成';
//     }).catch(err=>{
//         return '替换文件出错';
//     });
// }

// /**
//  * 根据项目ID替换目标路径下的ft.js文件
//  * @param {目标路径} dst 
//  * @param {项目ID} project_id 
//  */
// pcon.reFt = async function(dst,project_id){
//     var ftPath = `${dst}/fieldTable/ft.js`;
//     var fileContext = fs.readFileSync(ftPath,'utf-8');
//     var sql = `select m.moduleId,u.orgin_field,u.target_field,u.is_weiyi,u.is_default,u.is_dict,u.is_double,u.is_date,u.dict_id,
//     u.dict_text,u.default_field,u.decimal_place,u.sdf,u.table_name from userField u left join module m on u.module_id = m.id 
//     where u.deleteFlag = 0 and u.project_id = ${project_id}`;
//     return await mysql.query(sql).then(re=>{
//         var ft = {},moduleObj = {};
//         for(var i = 0;i<re.length;i++){
//             var item = re[i];
//             var moduleId = item.moduleId;
//             if(moduleObj[moduleId]){
//                 var arr = moduleObj[moduleId];
//                 arr.push(item);
//                 moduleObj[moduleId] = arr;
//             }else{
//                 moduleObj[moduleId] = [item];
//             }
//         }
//         fileContext = fileContext.replace('CUSTOM_OBJ',JSON.stringify(moduleObj));
//         fs.writeFileSync(ftPath,fileContext,'utf-8');
//         return dst;
//     }).catch(err=>{
//         console.log(err);
//         return err;
//     })
// }


module.exports = pService;