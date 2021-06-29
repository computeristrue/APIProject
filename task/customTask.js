const log = require('../utils/log').logger;
const config = require('../utils/config').config;
const userId = config.userId;
const schedule = require('node-schedule');


/**
 * 企业自定义的任务就在这里执行
 */

const begin = async () => {
    if (userId == 'ZJKN') {
        //同步库存
        const syncProductStorage = require('./syncProductStorage');
        const customerPrice = require('./customerPrice');
        syncProductStorage.begin();
        customerPrice.begin();
        setInterval(() => {
          syncProductStorage.begin();
        }, 1000 * 60 * 30);
        schedule.scheduleJob("00 00 05 * * *", () => {//凌晨五点执行
            customerPrice.begin();
            console.log(`${userId}定时任务`, moment().format('YYYY-MM-DD HH:mm:ss'));
        });
    }
}


module.exports = {
    begin: begin
}