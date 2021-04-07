const log = require('./log').logger;
const redis = require('./redis');
const moment = require('moment');

const insert = async (moduleId, record, ft, tableName) => {
    let str = `insert into ${tableName}`;
    let fieldArr = [], valueArr = [];
    let keyVal = (await manageFieldValue(moduleId, record, ft, tableName)).keyVal;
    for (const key in keyVal) {
        if (Object.hasOwnProperty.call(keyVal, key)) {
            const val = keyVal[key];
            fieldArr.push(key);
            valueArr.push(val);
        }
    }
    str += "(" + fieldArr.join(',') + ")values(" + valueArr.join(",") + ")";
    return str;
}

const update = async (moduleId, record, ft, tableName) => {
    let str = `update ${tableName} set `;
    let condition = "", finallyCondition = "";
    const fieldValue = await manageFieldValue(moduleId, record, ft, tableName);
    let keyVal = fieldValue.keyVal;
    condition = fieldValue.condition;
    for (const key in keyVal) {
        if (Object.hasOwnProperty.call(keyVal, key)) {
            const val = keyVal[key];
            str += `${key} = ${val},`;
        }
    }
    if (str.endsWith(',')) {
        str = str.substring(0, str.length - 1);
    }
    if (condition == '') {
        return `select ''`;
    } else {
        str += condition;
        str += finallyCondition;
    }
    return str;
}

const manageFieldValue = async (moduleId, record, ft, tableName = null) => {
    let keyVal = {}, condition = "", finallyCondition = "";
    for (let i = 0; i < ft.length; i++) {
        const fieldInfo = ft[i];
        const origin_field = fieldInfo.origin_field, target_field = fieldInfo.target_field;
        let val = record[target_field] || "";
        if (fieldInfo.is_weiyi == 1) {
            if (typeof val == 'string') {
                val = val.replace(/'/g, "''");
                val = val ? `'${val}'` : 'null';
            }
            condition += ` where ${target_field} = ${val}`;
        } else if (fieldInfo.is_default == 1) {
            val = fieldInfo.default_field || "";
            if(val.indexOf('(') < 0 && val.indexOf(')') < 0){
                val = `'${val}'`;
            }
        } else if (fieldInfo.is_dict == 1) {
            let dict = await redis.hget('API_DATA_DICT', fieldInfo.dict_id);
            dict = JSON.parse(dict);
            dict.forEach(d => {
                if (d[fieldInfo['dict_text']] == val) {
                    val = d[fieldInfo['dict_val']];
                }
            });
        } else if (fieldInfo.is_double == 1) {
            val = val ? val : 0;
            if (fieldInfo.decimal_place) {
                val = Number(val.toFixed(fieldInfo.decimal_place));
            }
        } else if (fieldInfo.is_date == 1) {
            if (fieldInfo.sdf && val) {
                val = `'${moment(val).format(fieldInfo.sdf)}'`;
            }
        } else if (typeof val == 'string') {
            val = val.replace(/'/g, "''");
            val = val ? `'${val}'` : 'null';
        }
        keyVal[target_field] = val;
    }
    return {
        keyVal: keyVal,
        condition: condition,
        finallyCondition: finallyCondition
    };
}

module.exports = {
    insert: insert,
    update: update,
    manageFieldValue:manageFieldValue
}