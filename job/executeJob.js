const log = require('../utils/log').logger;
const redis = require('../utils/redis');
const pushData = require('../service/pushData');
const pullData = require('../service/pullData');
const config = require('../utils/config').config;
const userId = config.userId;

/**
 * 凯恩任务
 */
const product_storage = require('../task/syncProductStorage');
const customerPrice = require('../task/customerPrice');
const KNProduct = require('../task/KNProduct');

module.exports = async (moduleId, id = null) => {
    const kind = Number(await redis.hget(`API_${moduleId}`, 'kind'));
    if (userId == 'ZJKN') {
        if(moduleId == 'product_storage' && !kind){
            product_storage.begin();
        }else if(moduleId == 'get_customer_price' && !kind){
            customerPrice.begin();
        }else if(moduleId == 'get_product' && !kind){
            KNProduct.begin();
        }
    }
    if (kind == 1) {//推送
        console.log('这是推送呀');
        pushData(moduleId, id);
    } else if (kind == 2) {//拉取
        console.log('这是拉取啊');
        pullData(moduleId, id);
    }
}