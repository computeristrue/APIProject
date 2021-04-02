const axios = require('axios');
const redis = require('./redis');
const Qs = require('qs');

const doAxios = async (API_CONFIG_ID, record) => {
    const method = Number(await redis.hget(API_CONFIG_ID, 'method'));
    let methodStr = '';
    switch (method) {
        case 1:
            methodStr = 'post';
            break;
        case 2:
            methodStr = 'get';
            break;
        default:
            break;
    }
    const url = await redis.hget(API_CONFIG_ID, 'url');
    let finallyRecord = record || {};
    let extraParam = await redis.hget(API_CONFIG_ID, 'extraParam');
    if (extraParam) {
        let eObj = {};
        extraParam = extraParam.replace(/；/g, ';').replace(/：/g, ':');
        let eArr = extraParam.split(';');
        for (const index in eArr) {
            if (Object.hasOwnProperty.call(eArr, index)) {
                const item = eArr[index];
                let arr = item.split(':');
                if (arr[0] && arr[1]) {
                    eObj[arr[0]] = arr[1];
                }
            }
        }
        extraParam = eObj;
        for (const extraName in extraParam) {
            if (Object.hasOwnProperty.call(extraParam, extraName)) {
                const extraValue = extraParam[extraName];
                finallyRecord[extraName] = extraValue;
            }
        }
    }
    let data_place = await redis.hget(API_CONFIG_ID, 'data_place');
    let success_place = await redis.hget(API_CONFIG_ID, 'success_place');
    const success_val = await redis.hget(API_CONFIG_ID, 'success_val');
    let param = finallyRecord;
    let contentType = await redis.hget(API_CONFIG_ID, 'contentType');
    contentType = Number(contentType);
    let headers = await redis.hget(API_CONFIG_ID, 'headers');
    let obj = {};
    if (headers) {
        //通过分割字符串解析
        headers = headers.replace(/；/g, ';').replace(/：/g, ':');
        let hArr = headers.split(';');
        for (const index in hArr) {
            if (Object.hasOwnProperty.call(hArr, index)) {
                const item = hArr[index];
                let arr = item.split(':');
                if (arr[0] && arr[1]) {
                    if (arr[0].toLowerCase() == 'content-type' || arr[0].toLowerCase() == 'contenttype') {
                        arr[0] = 'content-type';
                    }
                    obj[arr[0]] = arr[1];
                }
            }
        }
    }
    switch (contentType) {
        case 1:
            param = finallyRecord;
            obj['content-type'] = 'application/json';
            break;
        case 2:
            param = Qs.stringify(finallyRecord);
            obj['content-type'] = 'application/x-www-form-urlencoded';
            break;
        case 3:
            param = finallyRecord//todo 解析XML功能待开发
            obj['content-type'] = 'application/xml';
        default:
            break;
    }
    headers = obj;
    let operation = {
        url: url,
        method: methodStr,
        params: param
    }
    if (headers) {
        operation['headers'] = headers;
    }
    console.log(operation);
    let response = await axios(operation);
    const status = response.status, data = response.data;
    data_place = data_place.split('.');
    let finallyData = data;
    for (const index in data_place) {
        if (Object.hasOwnProperty.call(data_place, index)) {
            const element = data_place[index];
            if (element) {
                finallyData = finallyData[element];
            }
        }
    }
    let successFlag = data;
    success_place = success_place.split('.');
    for (const index in success_place) {
        if (Object.hasOwnProperty.call(success_place, index)) {
            const element = success_place[index];
            if (element) {
                successFlag = successFlag[element];
            }
        }
    }
    let syncResult = 0;
    if (success_place && success_val) {
        if (successFlag.toString() == success_val.toString()) {
            syncResult = 1;
        } else {
            syncResult = 2;
        }
    }
    return { finallyData: finallyData, syncResult: syncResult };
}

// (async () => {
//     const result = await doAxios(`API_CONFIG_ID_${1}`, {});
//     console.log(result);
// })()
module.exports = {
    do: doAxios
}