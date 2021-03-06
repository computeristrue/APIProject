var redis = require('redis');
// var BPromise = require('bluebird');
var config = require('./config').config;
var redisConfig = config.redis;
var RDS_PORT = redisConfig.port,
    RDS_HOST = redisConfig.host,
    RDS_PASSWORD = redisConfig.password;
var client = redis.createClient(RDS_PORT, RDS_HOST, RDS_PASSWORD);

client.on('error', (err) => {
    console.log(err);
})

var r = {};


/**
 * 存储字符型数据
 * @param {*} key 
 * @param {*} val 
 * @returns 
 */
r.set = async (key, val) => {
    try {
        val = JSON.stringify(val);
        return client.set(key, val, (err, reply) => {
        });
    } catch (error) {
        console.log(error);
    }
}

/**
 * 获取字符型数据
 * @param {*} key 
 * @returns 
 */
r.get = async (key) => {
    return new Promise((resolve, reject) => {
        client.get(key, (err, data) => {
            if (err) {
                reject(err);
                return
            }
            resolve(JSON.parse(data));
        });
    })
}

/**
 * 存储list类型数据，val可以为数组（从右边添加）
 * @param {*} key 
 * @param {*} val 
 * @returns list的长度
 */
r.rpush = async (key,val)=>{
    return new Promise((resolve,reject)=>{
        client.rpush(key,val,(err,data)=>{
            if(err){
                reject(err);
                return
            }
            resolve(data);
        })
    });
}

/**
 * 存储list类型数据，val可以为数组（从左边添加）
 * @param {*} key 
 * @param {*} val 
 * @returns 
 */
r.lpush = async(key,val)=>{
    return new Promise((resolve,reject)=>{
        client.lpush(key,val,(err,data)=>{
            if(err){
                reject(err);
                return
            }
            resolve(data);
        });
    });
}

/**
 * 获取list类型数据
 * @param {*} key 
 * @param {开始位置0} start 
 * @param {结束位置-1为最后} stop 
 * @returns 
 */
r.lrange = async (key,start,stop)=>{
    return new Promise((resolve,reject)=>{
        client.lrange(key,start,stop,(err,data)=>{
            if(err){
                reject(err);
                return;
            }
            resolve(data);
        })
    });
}

/**
 * 从list左边弹出一个值并返回
 * @param {*} key 
 * @returns 
 */
r.lpop = async(key)=>{
    return new Promise((resolve,reject)=>{
        client.lpop(key,(err,data)=>{
            if(err){
                reject(err);
                return
            }
            resolve(data);
        })
    })
}

/**
 * 从list左边弹出一个值并返回（空list会等待一段时间）
 * @param {*} key 
 * @param {*} second 
 * @returns 
 */
r.blpop = async(key,second)=>{
    return new Promise((resolve,reject)=>{
        client.BLPOP(key,second,(err,data)=>{
            if(err){
                reject(err);
                return
            }
            resolve(data);
        })
    })
}

/**
 * 从list右边弹出一个值并返回
 * @param {*} key 
 * @returns 
 */
r.rpop = async(key)=>{
    return new Promise((resolve,reject)=>{
        client.rpop(key,(err,data)=>{
            if(err){
                reject(err);
                return
            }
            resolve(data);
        });
    })
}

/**
 * 从list右边弹出一个值并返回(空list会等待一段时间)
 * @param {*} key 
 * @param {秒数} second 
 * @returns 
 */
r.brpop = async(key,second)=>{
    return new Promise((resolve,reject)=>{
        client.BRPOP(key,second,(err,data)=>{
            if(err){
                reject(err);
                return
            }
            resolve(data);
        })
    })
}

/**
 * 设置过期秒数
 * @param {*} key 
 * @param {秒数} second 
 * @returns 
 */
r.expire = (key,second)=>{
    return client.expire(key,second);
}

module.exports = r;