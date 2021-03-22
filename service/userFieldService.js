var log = require('../utils/log').logger;
var mysql = require('../utils/mysql');

var uc = {};

uc.search = function(project_id){
    var sql = `select u.*,m.moduleId from userField u left join module m on u.module_id = m.id where u.deleteFlag = 0 and u.project_id = ${project_id};`;
    mysql.query(sql).then(re=>{
        var json = {};
        for(var i = 0;i<re.length;i++){
            var item = re[i];
            var obj = {};
            for(var key in item){
                if(key != 'id' && key != 'project_id' && key != "module_id" && key != "deleteFlag" && key != "dateCreated" && key != "lastUpdated"){
                    obj[key] = item[key];
                }
            }
            var moduleId = item.moduleId;
            if(json[moduleId]){
                var arr = json[moduleId];
                arr.push(obj);
                json[moduleId] = arr;
            }else{
                json[moduleId] = [obj];
            }
        }
        console.log(json);
    })
}

uc.dealData = function(records){
    var json = {};
    if(records && records.length > 0){

    }else{
        console.log('字段更新完成');
    }
}

uc.save = function(){

}

module.exports = uc;