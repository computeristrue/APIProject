var mysql = require('./mysql');

var dict = {};

dict.get = function(dictId){
    return new Promise((resolve,reject)=>{
        var sql = `select id,name from ${dictId} where deleteFlag = 0 order by name`;
        var obj = {};
        mysql.query(sql).then(re=>{
            for(var i = 0;i<re.length;i++){
                var item = re[i];
                obj[item.id] = item.name;
            }
            resolve(obj);
        }).catch(err=>{
            reject(err);
        });
    });
}


module.exports = dict;