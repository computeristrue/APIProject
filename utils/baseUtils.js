const log = require('./log').logger;

const groupArray = (array, len) => {
    var index = 0;
    var newArray = [];
    while (index < array.length) {
        newArray.push(array.slice(index, index += len));
    };
    return newArray;
}

const sleep = (numberMillis) => {
    var now = new Date();
    var exitTime = now.getTime() + numberMillis;
    while (true) {
        now = new Date();
        if (now.getTime() > exitTime)
            return;
    }
}


/**
 * 保存数据
 * @param {string} tableName 表名
 * @param {object} kv 值关系
 * @param {string} condition 修改条件
 * @param {boolean} isAdd 是否新增
 * @returns 操作是否成功
 */
 const save = (tableName, kv, condition, isAdd = true) => {
    let sql;
    let keyArr = [], argArr = [], valArr = [];
    try {
        if (Object.keys(kv).length > 0) {
            if (isAdd) {
                for (const key in kv) {
                    if (Object.hasOwnProperty.call(kv, key)) {
                        const value = kv[key];
                        keyArr.push(key);
                        argArr.push('?');
                        valArr.push(value);
                    }
                }
                sql = `insert into ${tableName} (${keyArr.join(',')}) values (${argArr.join(',')})`;
            } else {
                for (const key in kv) {
                    if (Object.hasOwnProperty.call(kv, key)) {
                        const value = kv[key];
                        keyArr.push(`${key} = ?`);
                        valArr.push(value);
                    }
                }
                sql = `update ${tableName} set ${keyArr.join(',')} where ${condition}`;
            }
        }
    } catch (error) {
        log.info(error);
    } finally {
        return {sql:sql,valArr:valArr};
    };
}

module.exports = {
    groupArray: groupArray,
    sleep:sleep,
    save:save
}