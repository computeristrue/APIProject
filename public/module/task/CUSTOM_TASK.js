var config = require('../utils/config').config;
var schedule = require('node-schedule');
var moment = require('moment');
var moduleObj = config.module;
var ftFile = require('../fieldTable/ft');
var sf = require('../utils/sqlFactory');
var bs = require('../utils/baseSql');



var cTask = {};
var num = 0;

cTask.begin = function () {
    for (var moduleId in moduleObj) {
        var item = moduleObj[moduleId];
        var polling_mode = item.polling_mode;
        if (polling_mode == 'Interval') { //自定义轮询任务
            cTask.f1(moduleId,item);
        }else if(polling_mode == 'schedule'){ //自定义定时任务
            cTask.f2(moduleId,item);
        }
    }
}

/**
 * 自定义轮询任务
 * @param {模块ID} moduleId 
 * @param {配置详情} item 
 */
cTask.f1 = function(moduleId,item){
    setInterval(() => {
        console.log(moduleId,++num);
    }, eval(item.interval_));
}

/**
 * 自定义定时任务
 * @param {模块ID} moduleId 
 * @param {配置详情} item 
 */
cTask.f2 = function(moduleId,item){
    schedule.scheduleJob(item.interval_,()=>{
        var ft = ftFile[moduleId];
        var dbInfo = config.db[item.read_db];
        var sql = sf.MYSQL(ft,item.table_name,'',true);
        bs.query(dbInfo,sql).then(re=>{
            console.log(re);
        })
        console.log(`${moduleId}定时任务`,moment().format('YYYY-MM-DD HH:mm:ss'));
    });
}


module.exports = cTask;