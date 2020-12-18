var mysql = require('./mysql');

var dict = {};

dict.get = function (dictId) {
    return new Promise((resolve, reject) => {
        var sql = `select id,name from ${dictId} where deleteFlag = 0 order by name`;
        var obj = {};
        mysql.query(sql).then(re => {
            for (var i = 0; i < re.length; i++) {
                var item = re[i];
                obj[item.id] = item.name;
            }
            resolve(obj);
        }).catch(err => {
            reject(err);
        });
    });
}

dict.getLink = function (tableName, link, linkId) {
    var condition = `where deleteFlag = 0`;
    if (link && linkId) {
        condition += ` and ${link} = ${linkId}`;
    }
    var sql = `select id,name from ${tableName} ${condition} order by name`;
    var obj = {};
    console.log(sql);
    return new Promise((resolve, reject) => {
        mysql.query(sql).then(re => {
            for (var i = 0; i < re.length; i++) {
                var item = re[i];
                obj[item.id] = item.name;
            }
            resolve(obj);
        }).catch(err => {
            reject(err);
        });
    });
}


module.exports = dict;