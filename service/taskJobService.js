const schedule = require('node-schedule');
const moment = require('moment');
const redis = require('../utils/redis');
const log = require('../utils/log').logger;



async function interval_job(moduleId) {
    try {
        const moduleObj = redis.get(moduleId) || {};
        const interval_ = moduleObj.interval_ || 3000;
        const t1 = setInterval(() => {
            // executeJob(moduleId);
            console.log(`${moduleId}轮询任务`, moment().format('YYYY-MM-DD HH:mm:ss'));
        }, eval(interval_));
        return t1;
    } catch (error) {
        log.info(error);
    };
}

function schedule_job(moduleId) {
    const moduleObj = redis.get(moduleId);
    const interval_ = moduleObj.interval_;
    schedule.scheduleJob(interval_, () => {
        // executeJob(moduleId);
        console.log(`${moduleId}定时任务`, moment().format('YYYY-MM-DD HH:mm:ss'));
    });
}

module.exports = {
    iJob: interval_job,
    sJob: schedule_job
}