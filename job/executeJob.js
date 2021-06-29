const log = require('../utils/log').logger;
const redis = require('../utils/redis');
const pushData = require('../service/pushData');
const pullData = require('../service/pullData');
/**
 * 凯恩任务
 */
const product_storage = require('../task/syncProductStorage');
const customerPrice = require('../task/customerPrice');

module.exports = async (moduleId,id = null)=>{
    const kind = Number(await redis.hget(`API_${moduleId}`,'kind'));
    if(moduleId == 'product_storage' && !kind){
        product_storage.begin();
    }else if(moduleId == 'get_customer_price' && !kind){
        customerPrice.begin();
    }else{
        if(kind == 1){//推送
            console.log('这是推送呀');
            pushData(moduleId,id);
        }else if(kind == 2){//拉取
            console.log('这是拉取啊');
            pullData(moduleId,id);
        }
    }
}