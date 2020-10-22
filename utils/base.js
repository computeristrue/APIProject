var mysql = require('./mysql');
var ft = require('../ft/domain');
var saveInfo = require('./saveInfo');

var base = {};

base.list = function (tableName,condition = "") {
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
            field.push(relName.replace('~', '') + '.name' + ' as ' + relAlias);
            field.push(`${tableName}.${key}`);
            if (relName.indexOf('~') < 0) {
                froms += ` left join ${relName} on ${tableName}.${key} = ${relName}.id`;
            }
        } else {
            field.push(`${tableName}.${key}`);
        }
    }
    sql += `${field.toString()} from ${froms} where ${tableName}.deleteFlag = 0 ${condition}`;
    return sql;
};

base.count = function(tableName,condition = ""){
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
                froms += ` left join ${relName} on ${tableName}.${key} = ${relName}.id`;
            }
        }
    }
    sql += `from ${froms} where ${tableName}.deleteFlag = 0 ${condition}`;
    return sql;
}

base.save = function(params,tableName){
    var dbInfo = {};
    var domain = ft[tableName];
    for(var key in domain){
        var value = domain[key];
        var dbType = value.split('@')[0];
        dbInfo[key] = dbType;
    }
    return saveInfo(params,dbInfo,tableName);
}
module.exports = base;