const schedule = require('node-schedule');
const moment = require('moment');
const redis = require('../utils/redis');
const log = require('../utils/log').logger;
const executeJob = require('../job/executeJob');



async function interval_job(moduleId, redis_key) {
    try {
        console.log(`${moduleId}轮询任务开始`);
        let interval_ = await redis.hget(redis_key, 'interval_');
        interval_ = eval(interval_) * 1000 * 60;
        setInterval(() => {
            executeJob(moduleId);
            console.log(`${moduleId}轮询任务`, moment().format('YYYY-MM-DD HH:mm:ss'));
        }, eval(interval_));
    } catch (error) {
        log.info(error);
    };
}

async function schedule_job(moduleId, interval_) {
    try {
        console.log(`${moduleId}定时任务开始`);
        schedule.scheduleJob(interval_, () => {
            executeJob(moduleId);
            console.log(`${moduleId}定时任务`, moment().format('YYYY-MM-DD HH:mm:ss'));
        });
    } catch (error) {
        log.info(error);
    };
}

const buildJob = async (moduleId) => {
    const redis_key = `API_${moduleId}`;
    const polling_mode = Number(await redis.hget(redis_key, 'polling_mode'));
    console.log(polling_mode);
    if (polling_mode == 1) {//轮询任务
        interval_job(moduleId, redis_key);
    } else if (polling_mode == 2) {//定时任务
        const interval_ = await redis.hget(redis_key, 'interval_');
        schedule_job(moduleId, interval_);
    } else if(polling_mode == 3){//定时任务（一般模式）
        const hourIndex = await redis.hget(redis_key, 'hourIndex');
        const minuteIndex = await redis.hget(redis_key, 'minuteIndex');
        let interval_ = `00 ${minuteIndex} ${hourIndex} * * *`;
        schedule_job(moduleId, interval_);
    }
}

module.exports = {
    buildJob: buildJob
}