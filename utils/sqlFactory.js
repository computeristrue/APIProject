var log = require('../utils/log').logger;
var config = require('../utils/config').config;

var sf = {};

/**
 * 查询MySQL数据
 * @param {字段配置信息} ft 
 * @param {表名} tableName 
 * @param {查询条件} condition 
 * @param {是否CRM表} isCRM
 */
sf.MYSQL = function(ft,tableName,condition = "",isCRM = true){
    var sql = `select `;
    if(isCRM){
        sql += `${tableName}.id,`;
    }
    var field = [],relTable = {};
    var forms = ` ${tableName}`;
    for(var i = 0;i<ft.length;i++){
        var item = ft[i];
        var fieldName = item.origin_field;
        var targetName = item.target_field;
        if(isCRM){
            if(item.is_default == 1){//是否默认值
                field.push(`'${item.default_field}' as ${targetName}`);
            }else if(item.is_detail == 1){//明细字段先不处理
            }else if(item.table_name){//关联的表
                var relTableName = item.table_name;
                var alias = fieldName.split('.')[0],
                    name = fieldName.split('.')[1];
                var keyStr = `${relTableName}_${alias}`;
                if(!relTable[keyStr]){//owner.name owner.account employee.name employee.account
                    forms += ` left join ${relTableName} on ${tableName}.${alias}_id = ${relTableName}.id`;
                    relTable[keyStr] = 1;
                }
                field.push(`${relTableName}.${name} as ${targetName}`);
            }else {
                field.push(`${tableName}.${fieldName} as ${targetName}`);
            }
        }else{
            if(item.is_default == 1){//是否默认值
                field.push(`'${item.default_field}' as ${targetName}`);
            }else if(item.is_detail == 1){//明细字段不处理
            }else{
                field.push(`${tableName}.${fieldName} as ${targetName}`);
            }
        }
    }
    if(isCRM){
        condition += ` and ${tableName}.delete_flag = 0`;//and ${tableName}.user_id = 1 and
    }
    sql += `${field.toString()} from ${forms} where 1 = 1 ${condition}`;
    return sql;
}

/**
 * 查询SQL server数据
 * @param {字段配置信息} ft 
 * @param {表名} tableName 
 * @param {查询条件} condition 
 * @param {是否CRM表} isCRM 
 */
sf.MSSQL = function(ft,tableName,condition = "",isCRM = true){
    var sql = `select `;
    if(isCRM){
        sql += `${tableName}.id,`;
    }
    var field = [],relTable = {};
    var forms = ` from ${tableName}`;
    for(var i = 0;i<ft.length;i++){
        var item = ft[i];
        var fieldName = item.origin_field;
        var targetName = item.target_field;
        if(isCRM){
            if(item.is_default == 1){//是否默认值
                field.push(`'${item.default_field}' as ${targetName}`);
            }else if(item.is_detail == 1){//明细字段不处理
            }else if(item.table_name){//关联的表
                var relTableName = item.table_name;
                var alias = fieldName.split('.')[0],
                    name = fieldName.split('.')[1];
                var keyStr = `${relTableName}_${alias}`;
                if(!relTable[keyStr]){//owner.name owner.account employee.name employee.account
                    forms += ` left join ${relTableName} on ${tableName}.${alias}_id = ${relTableName}.id`;
                    relTable[keyStr] = 1;
                }
                if(item.is_date == 1){
                    field.push(`CONVERT(varchar(20),${relTableName}.${name},20) as ${targetName}`);
                }else{
                    field.push(`${relTableName}.${name} as ${targetName}`);
                }
            }else {
                if(item.is_date == 1){
                    field.push(`CONVERT(varchar(20),${tableName}.${fieldName},20) as ${targetName}`);
                }else{
                    field.push(`${tableName}.${fieldName} as ${targetName}`);
                }
            }
        }else{
            if(item.is_date == 1){
                field.push(`CONVERT(varchar(20),${fieldName},20) as ${targetName}`);
            }else if(item.is_default == 1){//是否默认值
                field.push(`'${item.default_field}' as ${targetName}`);
            }else if(item.is_detail == 1){//是否明细字段
            }else{
                field.push(`${tableName}.${fieldName} as ${targetName}`);
            }
        }
    }
    if(isCRM){
        condition += ` and ${tableName}.delete_flag = 0`;//and ${tableName}.user_id = 1 and
    }
    sql += `${field.toString()} ${forms} where 1 = 1 ${condition}`;
    return sql;
}

module.exports = sf;