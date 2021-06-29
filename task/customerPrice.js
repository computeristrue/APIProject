const log = require('../utils/log').logger;
const config = require('../custom/ZJKN');
const baseSql = require('../utils/baseSql');
const moment = require('moment');


/**
 * SQL Server数据库配置
 */
const mssqlInfo = config.db.mssql;

/**
 * CRM数据库配置
 */
const crmInfo = config.db.crm;

/**
 * 任务入口
 */
const begin = async () => {
    const sql = `select * from Cust_KaiEn_SalePrice where 有效 = 1`;
    try {
        const records = await baseSql.query(mssqlInfo, sql);
        const args = await getRelInfo();
        log.info("查询价表数据" + records.length + "条");
        if (records && records.length > 0) {
            let mainAndDetail = {};
            for (let i = 0; i < records.length; i++) {
                const record = records[i];
                const key = record.价表编码;
                let items = mainAndDetail[key] || [];
                items.push(record);
                mainAndDetail[key] = items;
            }
            for (const decode in mainAndDetail) {
                if (Object.hasOwnProperty.call(mainAndDetail, decode)) {
                    const items = mainAndDetail[decode];
                    let mainRecord = items[0];
                    if (!mainRecord) {
                        continue;
                    }
                    await saveMain(mainRecord, args);
                    if (items && items.length > 0) {//开始处理明细表
                        for (let i = 0; i < items.length; i++) {
                            let detailRecord = items[i];
                            await saveDetail(detailRecord, args);
                        }
                    }
                }
            }
        }
        log.info('价表数据处理完毕');
    } catch (error) {
        log.info(error);
    };
};

/**
 * 返回关联表的信息
 * @returns 关联表的信息
 */
const getRelInfo = async () => {
    let args = {};
    let customer = {};
    let product = {};
    let customerPriceInfo = {};
    let productHistoryPrice = {};
    let customerAddress = {};
    let extend17 = {};//dict 191 客户分类
    const extend17_dict_id = 191;
    let extend16 = {};//dict 163 币种
    const extend16_dict_id = 163;
    try {
        const customerSql = `select id,three_part_decode from t_customer where delete_flag = 0`;
        const cusRecords = await baseSql.query(crmInfo, customerSql);
        cusRecords && cusRecords.map(item => {
            customer[item.three_part_decode] = item.id;
        });
        const productSql = `select id,name,three_part_decode from t_product where delete_flag = 0`;
        const proRecords = await baseSql.query(crmInfo, productSql);
        proRecords && proRecords.map(item => {
            product[item.three_part_decode] = item.id;
        });
        const customerPriceInfoSql = `select id,decode from t_customer_price_info where delete_flag = 0`;
        const cpiRecords = await baseSql.query(crmInfo, customerPriceInfoSql);
        cpiRecords && cpiRecords.map(item => {
            customerPriceInfo[item.decode] = item.id;
        });
        const productHistoryPriceSql = `select id,three_part_decode from t_product_history_price where delete_flag = 0`;
        const phpRecords = await baseSql.query(crmInfo, productHistoryPriceSql);
        phpRecords && phpRecords.map(item => {
            productHistoryPrice[item.three_part_decode] = item.id;
        });
        const customerAddressSql = `select id,name from t_customer_address where delete_flag = 0`;
        const caRecords = await baseSql.query(crmInfo, customerAddressSql);
        caRecords && caRecords.map(item => {
            customerAddress[item.name] = item.id;
        });
        const extend17Sql = `select item.item_id,item.text,item.encode from t_data_dict_item item left join t_data_dict dict on item.dict_id = dict.id where dict.data_id = ${extend17_dict_id}`;
        const extend17Records = await baseSql.query(crmInfo, extend17Sql);
        extend17Records && extend17Records.map(item => {
            extend17[item.encode] = item.id;
        });
        const extend16Sql = `select item.item_id,item.text,item.encode from t_data_dict_item item left join t_data_dict dict on item.dict_id = dict.id where dict.data_id = ${extend16_dict_id}`;
        const extend16Records = await baseSql.query(crmInfo, extend16Sql);
        extend16Records && extend16Records.map(item => {
            extend16[item.text] = item.id;
        });
        args.customer = customer;
        args.product = product;
        args.customerPriceInfo = customerPriceInfo;
        args.productHistoryPrice = productHistoryPrice;
        args.customerAddress = customerAddress;
        args.extend17 = extend17;
        args.extend16 = extend16;
    } catch (error) {
        log.info(error);
    } finally {
        return args;
    };
}

/**
 * 解析源数据
 * @param {*} record 
 * @param {*} args 
 */
const parseRecord = (record, args, isMain = true) => {
    let kv = {};
    let product_id = args.product[record.料号];
    let customer_price_info_id = args.customerPriceInfo[record.价表编码];
    let product_history_price_id = args.productHistoryPrice[record.料品分类编码];
    let customer_id = args.customer[record.客户编码];
    let extend17 = args.extend17[record.客户类编码];
    let customer_address_id = args.customerAddress[record.位置编码];
    let extend16 = args.extend16[record.币种];
    if (isMain) {//主表
        kv.decode = record.价表编码;
        kv.name = record.价表名称;
        if (extend16) {
            kv.extend16 = extend16;
        }
        kv.extend17 = record.价格含税 == 1 ? 1 : 2;
    } else {//明细表
        if (product_id) {//料号
            kv.product_id = product_id;
        }
        if (customer_price_info_id) {//主表ID
            kv.customer_price_info_id = customer_price_info_id;
        }
        if (product_history_price_id) {//产品历史价格
            kv.product_history_price_id = product_history_price_id;
        }
        if (customer_id) {//客户
            kv.customer_id = customer_id;
        }
        if (extend17) {//客户分类
            kv.extend17 = extend17;
        }
        if (customer_address_id) {//客户位置
            kv.customer_address_id = customer_address_id;
        }
        if (record.单价) {
            kv.sale_price = record.单价;
        }
        if (record.生效时间) {
            kv.extend41 = getDate(record.生效时间);
        }
        if (record.失效时间) {
            kv.extend42 = getDate(record.失效时间);
        }
    }
    return kv;
}

/**
 * 添加默认值
 * @param {*} kv 
 * @returns 
 */
const addDefaultValue = (kv, isMain = true) => {
    const currentDate = moment().format('YYYY-MM-DD HH:mm:ss');
    if (!kv.user_id) kv.user_id = 1;
    if (!kv.version) kv.version = 0;
    if (!kv.employee_id) kv.employee_id = 1;
    if (isMain) {
        if (!kv.owner_id) kv.owner_id = 1;
    }
    if (!kv.delete_flag) kv.delete_flag = 0;
    if (!kv.date_created) kv.date_created = currentDate;
    if (!kv.last_updated) kv.last_updated = currentDate;
    return kv;
}

/**
 * 保存数据
 * @param {string} tableName 表名
 * @param {object} kv 值关系
 * @param {string} condition 修改条件
 * @param {boolean} isAdd 是否新增
 * @returns 操作是否成功
 */
const save = async (tableName, kv, condition, isAdd = true) => {
    let sql;
    let keyArr = [], argArr = [], valArr = [];
    let is_success = true;
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
                const rs = await baseSql.query(crmInfo, sql, valArr);
            } else {
                for (const key in kv) {
                    if (Object.hasOwnProperty.call(kv, key)) {
                        const value = kv[key];
                        keyArr.push(`${key} = ?`);
                        valArr.push(value);
                    }
                }
                sql = `update ${tableName} set ${keyArr.join(',')} where ${condition}`;
                const rs = await baseSql.query(crmInfo, sql, valArr);
            }
        }
    } catch (error) {
        log.info(error);
        is_success = false;
    } finally {
        return is_success;
    };
}

/**
 * 保存主表
 * @param {*} mainRecord 
 * @param {*} args 
 */
const saveMain = async (mainRecord, args) => {
    const isMainExistSql = `select id from t_customer_price_info where delete_flag = 0 and decode = ?`;
    const isMainExist = await baseSql.query(crmInfo, isMainExistSql, [mainRecord.价表编码]);
    let mainKV = parseRecord(mainRecord, args);
    let mainCondition = "";
    let mainIsAdd = false;
    if (isMainExist && isMainExist.length > 0) {
        mainCondition = `decode = '${mainRecord.价表编码}'`;
    } else {
        mainKV = addDefaultValue(mainKV);
        mainIsAdd = true;
    }
    await save('t_customer_price_info', mainKV, mainCondition, mainIsAdd);//保存主表
}

/**
 * 保存明细
 */
const saveDetail = async (detailRecord, args) => {
    const isDetailExistSql = `select id from t_customer_price where delete_flag = 0 and id = ?`;
    const isDetailExist = await baseSql.query(crmInfo, isDetailExistSql, [detailRecord.CRMID]);
    let detailKV = parseRecord(detailRecord, args, false);
    let detailCondition = "";
    let detailIsAdd = false;
    if (isDetailExist && isDetailExist.length > 0) {
        detailCondition = `id = ${detailRecord.CRMID}`;
    } else {
        detailKV = addDefaultValue(detailKV, false);
        detailIsAdd = true;
    }
    await save('t_customer_price', detailKV, detailCondition, detailIsAdd);//保存明细
}

/**
 * 格式化日期
 * @param {*} str 
 * @returns 
 */
const getDate = (str) => {
    let result = moment();
    let oStr = str;
    try{
        if (str && str != "") {
            if(typeof str != 'string'){
                str = str + "";
            }
            // result = moment();
            // let arr = str.split('-');
            // let year = arr[0];
            // let month = arr[1];
            // let dayStr = arr[2];
            // let day, hour, minute, second, millisecond;
            // if (dayStr) {
            //     let dayArr = dayStr.split(' ');
            //     day = dayArr[0];
            //     let hmsmStr = dayArr[1];
            //     if(hmsmStr){
            //         let hmsmArr = hmsmStr.split(':');
            //         hour = hmsmArr[0];
            //         minute = hmsmArr[1];
            //         let secondStr = hmsmArr[2];
            //         if(secondStr){
            //             let smArr = secondStr.split('.');
            //             second = smArr[0];
            //             millisecond = smArr[1];
            //         }
            //     }
            // }
            // if (year) result.set('year', year);
            // if (month) result.set('month', Number(month) - 1);
            // if (day) result.set('date', day);
            // if (hour) result.set('hour', hour);
            // if (minute) result.set('minute', minute);
            // if (second) result.set('second', second);
            // if (millisecond) result.set('millisecond', millisecond);
            result = moment(str);
        }
    }catch(error){
        log.info(error);
    }finally{
        if(result.year() == 10000){
            result.set('year',9999);
        }
        result = result.format('YYYY-MM-DD HH:mm:ss');
        return result;
    };
}

module.exports = {
    begin: begin
}