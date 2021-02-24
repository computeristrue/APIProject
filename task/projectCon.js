var fs = require('fs');
var stat = fs.statSync
var log = require('../utils/log').logger;
var moment = require('moment');
var mysql = require('../utils/mysql');


var pcon = {};

/**
 * 复制文件夹
 */
pcon.copy = function (src, dst, unique = true) {
    if (!fs.existsSync(dst)) {
        fs.mkdirSync(dst);
    } else if (unique) {
        dst = dst.split('_')[0];
        dst = `${dst}_${moment().format('YYYYMMDDHHmmssSSS')}`;
        fs.mkdirSync(dst);
    }
    var paths = fs.readdirSync(src);
    paths.forEach(path => {
        var _src = `${src}/${path}`;
        var _dst = `${dst}/${path}`;
        var st = stat(_src);
        if (st.isFile()) {
            fs.writeFileSync(_dst, fs.readFileSync(_src));
        } else if (st.isDirectory()) {
            pcon.exists(_src, _dst, pcon.copy);
        }
    });
    return dst;
}

pcon.exists = function (src, dst, callback) {
    var exists = fs.existsSync(dst);
    if (exists) {
        callback(src, dst, false);
    } else {
        fs.mkdirSync(dst);
        callback(src, dst, false);
    }
}

pcon.reJson = async function (dst, project_id) {
    var json = JSON.parse(fs.readFileSync(`${dst}/config.json`));
    var sql1 = `select * from project where deleteFlag = 0 and id = ${project_id}`;
    var sql2 = `select * from dbConfig where deleteFlag = 0 and project_id = ${project_id}`;
    var sql3 = `select * from apiConfig where deleteFlag = 0 and project_id = ${project_id}`;
    var sql4 = `select * from module where deleteFlag = 0 and project_id = ${project_id}`;
    return await Promise.all([mysql.query(sql1), mysql.query(sql2), mysql.query(sql3), mysql.query(sql4)]).then(re => {
        var re1 = re[0], re2 = re[1], re3 = re[2], re4 = re[3];
        if (re1 && re1.length > 0) {
            var item = re1[0];
            var CUSTOM_DB_TYPE = item.kind == 1 ? 'mysql' : 'sqlServer';
            var CUSTOM_DB_CONFIG = {};
            CUSTOM_DB_CONFIG[CUSTOM_DB_TYPE] = {
                "host": item.host,
                "user": item.user,
                "password": item.password,
                "database": item.database_
            };
            if(CUSTOM_DB_TYPE == 'mysql')CUSTOM_DB_CONFIG[CUSTOM_DB_TYPE]['port'] = item.port;
            json.db.crm.dbType = CUSTOM_DB_TYPE;
            json.db.crm.info = CUSTOM_DB_CONFIG;
            json.api.crm = {
                "host": item.url,
                "authToken": item.authToken,
                "api_log": "apiLog/insert",
            };
        }
        var dbObj = {},apiObj = {};
        for(var i = 0;i<re2.length;i++){
            var record = re2[i];
            var dbType = record.kind == 1 ? 'mysql' : 'sqlServer';
            var info = {};
            info[dbType] = {
                "host": record.host,
                "user": record.user,
                "password": record.password,
                "database": record.database_
            }
            if(dbType == 'mysql')info[dbType]['port'] = record.port;
            json.db[record.name] = {
                "dbType":dbType,
                "info":info
            }
            dbObj[record.id] = record.name;
        }
        for(var i = 0;i<re3.length;i++){
            var record = re3[i];
            json.api[record.name] = {
                url:record.url,
                method:record.method == 1 ? 'post' : 'get',
                type:record.type == 1 ? 'json' : 'xml'
            };
            apiObj[record.id] = record.name;
        }
        for(var i =0;i<re4.length;i++){
            var record = re4[i];
            var moduleId = record.moduleId,name = record.name;
            var kind = record.kind == 1 ? 'push' : 'pull';
            json.module[moduleId] = {
                name:name,
                kind:kind,
                table_name:record.table_name,
                read_db:dbObj[record.read_db_id] ? dbObj[record.read_db_id] : '',
                write_db:dbObj[record.write_db_id] ? dbObj[record.write_db_id] : '',
                pull_api:apiObj[record.pull_api_id] ? apiObj[record.pull_api_id] : '',
                send_api:apiObj[record.send_api_id] ? apiObj[record.send_api_id] : '',
                polling_mode:record.polling_mode == 1 ? 'Interval' : 'schedule',
                interval_:record.interval_
            }
        }
        fs.writeFileSync(`${dst}/config.json`, JSON.stringify(json));
        return '配置文件替换完成';
    }).catch(err=>{
        return '替换文件出错';
    });
}

pcon.reWWW = async function(dst,project_id){
    var json = JSON.parse(fs.readFileSync(`${dst}/bin/www`));
    console.log(json);
    var sql = `select * from project where deleteFlag = 0 and id = ${project_id}`;
    mysql.query(sql).then({
        
    }).catch(err=>{
        console.log(err);
    })
}


module.exports = pcon;