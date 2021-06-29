const log = require('../utils/log').logger;
const oracle = require('../utils/oracle');
const mysql = require('../utils/baseSql');
const config = require('../custom/ZJKN');
const moment = require('moment');
/**
 * 凯恩电器同步库存的任务
 */

/**
 * CRM数据库
 */
const crmDB = config.db.crm;

/**
 * Oracle数据库
 */
const oracleDB = config.db.oracle;

/**
 * 程序入口
 */
const begin = async () => {
    try{
        const sql = "SELECT * FROM ZHC_KAN.VIEW_WMS_INV_QTY";
        const records = await oracle.query(oracleDB,sql);
        log.info('查询库存信息:'+ records.length + "条");
        const productSql = "select id,three_part_decode from t_product where delete_flag = 0";
        const productRec = await mysql.query(crmDB,productSql);
        let product = {};
        productRec && productRec.map(r=>{
            product[r.three_part_decode] = r.id;
        });
        const warehouseSql = "select id,three_part_decode from t_warehouse where delete_flag = 0";
        const warehouseRec = await mysql.query(crmDB,warehouseSql);
        let warehouse = {};
        warehouseRec && warehouseRec.map(r=>{
            warehouse[r.three_part_decode] = r.id;
        });
        let args = {
            product:product,
            warehouse:warehouse
        }
        for (let i = 0; i < records.length; i++) {
            const record = records[i];
            await saveByRecord(record,args);
        }
        log.info("库存信息拉取完毕");
    }catch(error){
        log.info(error);
    };
};

/**
 * 逐条保存库存
 * @param {*} record 
 * @param {*} args 
 */
const saveByRecord = async(record,args)=>{
    const productId = args.product[record.SKU] || false;
    const warehouseId = args.warehouse[record.WAREHOUSE_ID] || false;
    if(productId && warehouseId){
        const isExist = await isExistByProductAndWarehouse(productId,warehouseId);
        if(isExist){
            const updateSql = `update t_product_storage set extend34 = ${record.QTY},extend31 = ${record.QTY_TAKE},extend32 = ${record.QTY_SOFT_IN},extend33 = ${record.QTY_USE},last_updated = now() where product_id = ${productId} and warehouse_id = ${warehouseId}`;
            await mysql.query(crmDB,updateSql);
        }else{
            const insertSql = `insert into t_product_storage (version,user_id,owner_id,employee_id,date_created,last_updated,delete_flag,product_id,warehouse_id,extend34,extend31,extend32,extend33) 
            values(0,1,1,1,now(),now(),0,${productId},${warehouseId},${record.QTY},${record.QTY_TAKE},${record.QTY_SOFT_IN},${record.QTY_USE})`;
            await mysql.query(crmDB,insertSql);
        }
    }
}

/**
 * 根据产品和仓库判断库存是否存在
 * @param {*} productId 
 * @param {*} warehouseId 
 * @returns 
 */
const isExistByProductAndWarehouse = async (productId,warehouseId)=>{
    let isExist = false;
    const selectSql = `select id from t_product_storage where delete_flag = 0 and product_id = ${productId} and warehouse_id = ${warehouseId}`;
    const records = await mysql.query(crmDB,selectSql);
    if(records && records.length > 0){
        isExist = true;
    }
    return isExist;
}

const currentDate = (date,format = 'YYYY-MM-DD HH:mm:ss')=>{
    return moment(date).format(format);
}

module.exports = {
    begin: begin
}