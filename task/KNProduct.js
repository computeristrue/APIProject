const log = require('../utils/log').logger;
const config = require('../custom/ZJKN');
const baseSql = require('../utils/baseSql');
const { save } = require('../utils/baseUtils');
const moment = require('moment');

const oracleInfo = config.db.DAM;
const crmInfo = config.db.crm;


/**
 * 凯恩电器同步产品程序入口
 */
const begin = async () => {
    try {
        const sql = `select * from View_item where STOCKCATEGORY_CODE not like '1%' and not like '304%'`;
        const records = await baseSql.query(oracleInfo, sql);
        log.info('查询产品' + records.length + "条数据");
        if (records && records.length > 0) {
            let args = await getArgs();
            for (let i = 0; i < records.length; i++) {
                const record = records[i];
                let kv = parseData(record, args);
                const isExistSql = `select id from t_product where delete_flag = 0 and three_part_decode = ?`;
                const isExist = await baseSql.query(crmInfo, isExistSql, [record["item_code".toUpperCase()]]);
                let saveObject;
                let saveSql, valArr;
                if (isExist && isExist.length > 0) {
                    saveObject = save('t_product', kv, `three_part_decode = '${record["item_code".toUpperCase()]}'`, false);
                } else {
                    kv = addDefaultValue(kv);
                    saveObject = save('t_product', kv);
                }
                saveSql = saveObject.sql;
                valArr = saveObject.valArr;
                await baseSql.query(crmInfo, saveSql, valArr);
            }
        }
        log.info('产品保存完毕');
    } catch (error) {
        log.info(error);
    };
}

/**
 * 查询需要用到的参数
 */
const getArgs = async () => {
    let args = {};
    let product_kind = {};
    let unit = {};
    let unitId = 17;
    const pkSql = `select id,three_part_decode from t_product_kind where delete_flag = 0`;
    const pkRecords = await baseSql.query(crmInfo, pkSql);
    pkRecords && pkRecords.map(item => {
        product_kind[item.three_part_decode] = item.id;
    });
    const dict17Sql = `select item.text,item.item_id from t_data_dict_item item left join t_data_dict dict on item.dict_id = dict.id where dict.data_id = ${unitId}`;
    const dict17Records = await baseSql.query(crmInfo, dict17Sql);
    dict17Records && dict17Records.map(item => {
        unit[item.text] = item.item_id;
    });
    args.product_kind = product_kind;
    args.unit = unit;
    return args;
}

/**
 * 转换数据
 */
const parseData = (record, args) => {
    let kv = {};
    let product_kind_id = args.product_kind[record["StockCategory_code".toUpperCase()]];
    let unit = args.unit[record["SalesUOM".toUpperCase()]];
    let extend16 = args.unit[record["PriceUOM".toUpperCase()]];
    if (record["item_code".toUpperCase()]) {//料号
        kv.three_part_decode = record["item_code".toUpperCase()];
    }
    if (record["item_name".toUpperCase()]) {//产品名称
        kv.name = record["item_name".toUpperCase()];
    }
    if (record["item_specs".toUpperCase()]) {//产品型号
        kv.product_model = record["item_specs".toUpperCase()];
    }
    if (product_kind_id) {//库存分类编码
        kv.product_kind_id = product_kind_id;
    }
    if (unit) {//销售单位
        kv.unit = unit;
    }
    if (extend16) {//计价单位
        kv.extend16 = extend16;
    }
    if(kv.name && kv.product_model){
        kv.decode = `${kv.name}-${kv.product_model}`;
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
    if (!kv.delete_flag) kv.delete_flag = 0;
    if (!kv.date_created) kv.date_created = currentDate;
    if (!kv.last_updated) kv.last_updated = currentDate;
    return kv;
}

module.exports = {
    begin: begin
}