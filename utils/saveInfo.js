var moment = require('moment');

module.exports = function(params,ft,tableName){
    if(params.id && params.id != undefined){
        return update(params,ft,tableName);
    }else{
        return insert(params,ft,tableName);
    }
}


function insert(params,ft,tableName){
    var sql = `insert into ${tableName}`;
    var fieldArr = [],valueArr = [];
    for(var key in params){
        if(key == 'id') continue;
        var val = params[key];
        var dbType = ft[key] ? ft[key] : 'string';
        if(dbType == 'string'){
            val = val ? `'${val}'` : 'null';
        }
        if((dbType == 'double' || dbType == 'int') && key != 'id'){
            val = val ? val : 0;
        }
        if(dbType == 'date'){
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
    console.debug(sql);
    return sql;
}

function update(params,ft,tableName) {
    var sql = `update ${tableName} set `;
    var condition = ` where id = ${params.id}`;
    for(var key in params){
        if(key == 'id') continue;
        var val = params[key];
        var dbType = ft[key] ? ft[key] : 'string';
        if(dbType == 'string'){
            val = val ? `'${val}'` : 'null';
        }
        if((dbType == 'double' || dbType == 'int') && key != 'id'){
            val = val ? val : 0;
        }
        if(dbType == 'date'){
            val = moment(val).isValid() == true ? `'${moment(val).format('YYYY-MM-DD HH:mm:ss')}'` : null;
        }
        sql += `${key} = ${val},`;
    }
    var nowTime = `'${moment().format('YYYY-MM-DD HH:mm:ss')}'`;
    sql += `lastUpdated = ${nowTime}`;
    if(sql.endsWith(',')){
        sql = sql.substring(0,sql.length - 1);
    };
    sql += condition;
    console.debug(sql);
    return sql;
}