const log = require('../utils/log').logger;
const redis = require('../utils/redis');
const pushData = require('../service/pushData');

module.exports = async (moduleId,id = null)=>{
    const kind = Number(await redis.hget(`API_${moduleId}`,'kind'));
    console.log(kind);
    if(kind == 1){//推送
        console.log('这是推送呀');
        pushData(moduleId,id);
    }
}