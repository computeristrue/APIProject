const log = require('./log').logger;
const axios = require('axios');
const redis = require('./redis');
const Qs = require('qs');
const dateUtils = require('../utils/dateUtils');

const doAxios = async (API_CONFIG_ID, record,redis_key,originRecord) => {
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
                let arr,n,v;
                if(item.indexOf(':{') > -1){
                    arr = item.split(':{');
                    n = arr[0];
                    v = `{${arr[1]}`;
                    v = JSON.parse(v);
                    for (const key in v) {//先这样搞一下，满足使用需求
                        if (Object.hasOwnProperty.call(v, key)) {
                            let value = v[key];
                            if(value.indexOf("^") > -1){
                                let eName = value.replace('^','');
                                value = originRecord[eName];
                                v[key] = value;
                            }
                        }
                    }
                }else{
                    arr = item.split(':');
                    n = arr[0];
                    v = arr[1];
                }
                if (n && v) {
                    eObj[n] = v;
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
    if(redis_key){
        const timeField = await redis.hget(redis_key, 'timeField');
        const timestamp_ = await redis.hget(redis_key, 'timestamp_') || dateUtils.toString();
        if (timeField) {
            finallyRecord[timeField] = timestamp_;
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
        data: param
    }
    if (headers) {
        operation['headers'] = headers;
    }
    console.log(JSON.stringify(param));
    let response;
    try{
        response = await axios(operation);
    }catch(error){
        log.info(error);
    };
    const status = response.status, data = response.data;
    console.log(status);
    console.log(data);
    data_place = data_place.split('.');
    let finallyData = data;
    for (const index in data_place) {
        if (Object.hasOwnProperty.call(data_place, index)) {
            let element = data_place[index];
            if(element && element.indexOf('[') > -1){
                element = element.replace(/\[/g,'*').replace(/\]/g,'*');
                element = element.split('*');
                for (const i in element) {
                    if (Object.hasOwnProperty.call(element, i)) {
                        const el = element[i];
                        if(el){
                            finallyData = finallyData[el];
                        }
                    }
                }
            }else if (element) {
                finallyData = finallyData[element];
            }
        }
    }
    let successFlag = data;
    success_place = success_place.split('.');
    for (const index in success_place) {
        if (Object.hasOwnProperty.call(success_place, index)) {
            let element = success_place[index];
            if(element && element.indexOf('[') > -1){
                element = element.replace(/\[/g,'*').replace(/\]/g,'*');
                element = element.split('*');
                for (const i in element) {
                    if (Object.hasOwnProperty.call(element, i)) {
                        const el = element[i];
                        if(el){
                            successFlag = successFlag[el];
                        }
                    }
                }
            }else if (element) {
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
    console.log(finallyData,syncResult);
    return { finallyData: finallyData, syncResult: syncResult ,data:data};
}

module.exports = {
    do: doAxios
}