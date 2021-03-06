var mysql = require('../utils/mysql');
var ft = require('../ft/domain');
var moment = require('moment');

var me = {};


/**
 * 根据表名和条件生成查询SQL
 * @param {*} tableName 
 * @param {*} condition 
 * @returns 
 */
me.generateListSql = (tableName, condition = "") => {
    var sql = "select ";
    var field = [];
    field.push(`${tableName}.dateCreated`);
    field.push(`${tableName}.lastUpdated`);
    var froms = ` ${tableName} `;
    var domain = ft[tableName];
    for (var key in domain) {
        var value = domain[key];
        var relInfo = "", relName = "", relAlias = "";
        if (value.split('@')[1]) {
            relInfo = value.split('@')[1];
            relName = relInfo.split('#')[0];
            relAlias = relInfo.split('#')[1];
            field.push(`t_${relAlias.replace('~', '')}` + '.name' + ' as ' + relAlias);
            field.push(`${tableName}.${key}`);
            if (relName.indexOf('~') < 0) {
                froms += ` left join ${relName} as t_${relAlias} on ${tableName}.${key} = t_${relAlias}.id`;
            }
        } else {
            field.push(`${tableName}.${key}`);
        }
    }
    sql += `${field.toString()} from ${froms} where ${tableName}.deleteFlag = 0 ${condition}`;
    return sql;
}

/**
 * 根据参数得到查询结果
 * @param {*} params 
 * @returns 
 */
me.searchList = async (params) => {
    var results = [];
    try {
        var tableName = params.tableName;
        var page = params.page, limit = params.limit;
        var pageCondition = ` limit ${(page - 1) * limit},${limit}`;
        var listSql = me.generateListSql(tableName, pageCondition);
        results = await mysql.query(listSql);
    } catch (error) {
        console.log(error);
    }
    return results;
};

/**
 * 生成查询总条数SQL
 * @param {*} tableName 
 * @param {*} condition 
 * @returns 
 */
me.generateCountSql = function (tableName, condition = "") {
    var sql = "select count(1) total ";
    var froms = ` ${tableName} `;
    var domain = ft[tableName];
    for (var key in domain) {
        var value = domain[key];
        var relInfo = "", relName = "", relAlias = "";
        if (value.split('@')[1]) {
            relInfo = value.split('@')[1];
            relName = relInfo.split('#')[0];
            relAlias = relInfo.split('#')[1];
            if (relName.indexOf('~') < 0) {
                froms += ` left join ${relName} as t_${relAlias} on ${tableName}.${key} = t_${relAlias}.id`;
            }
        }
    }
    sql += `from ${froms} where ${tableName}.deleteFlag = 0 ${condition}`;
    return sql;
}

/**
 * 查询总条数
 * @param {*} params 
 * @returns 
 */
me.searchCount = async (params) => {
    var total = 0;
    try{
        var tableName = params.tableName;
        var countSql = me.generateCountSql(tableName);
        total = await mysql.query(countSql)[0];
    }catch(error){
        console.log(error);
    };
    return total;
}

/**
 * 保存数据
 * @param {*} params 
 * @param {*} tableName 
 * @returns 
 */
me.save = async function (params, tableName) {
    var json = { code: 0, msg: '保存失败' };
    try{
        var saveSql = '';
        var fieldInfo = {};
        var domain = ft[tableName];
        for (var key in domain) {
            var value = domain[key];
            var dbType = value.split('@')[0];
            fieldInfo[key] = dbType;
        }
        if (params.id && params.id != undefined) {
            saveSql = me.generateUpdateSql(params, fieldInfo, tableName);
        } else {
            saveSql = me.generateInsertSql(params, fieldInfo, tableName);
        }
        await mysql.query(saveSql);
        json = { code: 0, msg: '保存成功' };
    }catch(error){
        console.log(error);
    };
    return json
}

/**
 * 生成新增SQL
 * @param {*} params 
 * @param {*} ft 
 * @param {*} tableName 
 * @returns 
 */
me.generateInsertSql = (params, ft, tableName) => {
    var sql = `insert into ${tableName}`;
    var fieldArr = [], valueArr = [];
    for (var key in ft) {
        if (key == 'id') continue;
        var val = params[key];
        var dbType = ft[key] ? ft[key] : 'string';
        if (dbType == 'string') {
            val = val ? `'${val}'` : 'null';
        }
        if ((dbType == 'double' || dbType == 'int') && key != 'id') {
            val = val ? val : 0;
        }
        if (dbType == 'date') {
            val = moment(val).isValid() == true ? `'${moment(val).format('YYYY-MM-DD HH:mm:ss')}'` : null;
        }
        fieldArr.push(key);
        valueArr.push(val);
    }
    var nowTime = `'${moment().format('YYYY-MM-DD HH:mm:ss')}'`;
    fieldArr.push('dateCreated');
    valueArr.push(nowTime);
    fieldArr.push('lastUpdated');
    valueArr.push(nowTime);
    fieldArr.push('deleteFlag');
    valueArr.push('0');
    sql += `(${fieldArr.join(',')}) values (${valueArr.join(',')})`;
    return sql;
}

/**
 * 生成修改SQL
 * @param {*} params 
 * @param {*} ft 
 * @param {*} tableName 
 * @returns 
 */
me.generateUpdateSql = (params, ft, tableName) => {
    var sql = `update ${tableName} set `;
    var condition = ` where id = ${params.id}`;
    for (var key in ft) {
        if (key == 'id') continue;
        var val = params[key];
        var dbType = ft[key] ? ft[key] : 'string';
        if (dbType == 'string') {
            val = val ? `'${val}'` : 'null';
        }
        if ((dbType == 'double' || dbType == 'int') && key != 'id') {
            val = val ? val : 0;
        }
        if (dbType == 'date') {
            val = moment(val).isValid() == true ? `'${moment(val).format('YYYY-MM-DD HH:mm:ss')}'` : null;
        }
        sql += `${key} = ${val},`;
    }
    var nowTime = `'${moment().format('YYYY-MM-DD HH:mm:ss')}'`;
    sql += `lastUpdated = ${nowTime}`;
    if (sql.endsWith(',')) {
        sql = sql.substring(0, sql.length - 1);
    };
    sql += condition;
    return sql;
}

/**
 * 删除方法
 * @param {*} id 
 * @param {*} tableName 
 * @returns 
 */
me.delete = async(id,tableName)=>{
    var json = { code: 0, msg: '删除失败' };
    var sql = `update ${tableName} set deleteFlag = 1 where id = ${id}`;
    try{
        await mysql.query(sql);
        json = { code: 0, msg: '删除成功' };
    }catch(error){
        console.log(error);
    };
    return json
}

module.exports = me;