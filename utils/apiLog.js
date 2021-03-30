const log = require('./log').logger;
const request = require('request');
const config = require('./config').config;
const redis = require('./redis');

const key = 'API_BASIC_INFO';

const insert = async (dataModuleId, domainId, subject, syncResult, data, returnMsg, remark)=>{
    const authToken = await redis.hget(key,'authToken');
    const host = await redis.hget(key,'url');
    const url = host + 'apiLog/insert';
    var body = {
        dataModuleId: dataModuleId,
        domainId: domainId,
        subject: subject,
        syncResult: syncResult,
        data: data,
        returnMsg, returnMsg,
        remark: remark,
        moduleId: "api_log",
        authToken: authToken
    }
    var operation = {
        url: url,
        method: 'post',
        json: true,
        form: body
    }
    return new Promise((resolve,reject)=>{
        request(operation, function (err, response, data) {
            if (err) {
                log.info(err);
                reject(err);
            } else {
                resolve(dataModuleId + " id:" + domainId + "的APIlog添加" + JSON.stringify(data));
                log.info(dataModuleId + " id:" + domainId + "的APIlog添加" + JSON.stringify(data));
            }
        });
    })
}

module.exports = {
    insert:insert
}