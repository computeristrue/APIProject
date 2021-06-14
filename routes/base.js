var express = require('express');
var router = express.Router();
var mysql = require('../utils/mysql');
var baseService = require('../service/baseService');
const moduleService = require('../service/moduleService');
const dbConfigService = require('../service/dbConfigService');
const userFieldService = require('../service/userFieldService');
const projectService = require('../service/projectService');
const dataDictService = require('../service/dataDictService');
const apiConfigService = require('../service/apiConfigService');
const models = require('../model');

/**
 * 统一删除
 */
router.get('/del', async (req, res) => {
    var params = req.query;
    var id = params.id, tableName = params.tableName;
    const domain = models[tableName];
    let json = {code:0,msg:'删除成功'};
    try{
        await domain.destory({where:{id:id}});
    }catch(error){
        log.info(error);
        json = {code:0,msg:'删除失败'};
    }finally{
        res.json(json);
    };
});

/**
 * 统一查询
 */
router.get('/searchList', async (req, res) => {
    var params = req.query;
    var tableName = params.tableName;
    var moduleId = params.moduleId;
    const domain = models[tableName];
    let page = params.page;
    let limit = params.limit;
    let offset = (page - 1) * limit;
    let records = [],count = 0;
    let where = {};
    if(tableName == 'User_field' && moduleId){
        where = {where:{module_id:moduleId}};
    }
    let args = {};
    if(tableName == 'Module'){
        let dbconfig = {},apiconfig = {},module = {};
        dbconfig = await baseService.getIdAndName('Db_config');
        apiconfig = await baseService.getIdAndName('Api_config');
        module = await baseService.getIdAndName('Module');
        args = {
            dbconfig:dbconfig,
            apiconfig:apiconfig,
            module:module
        }
    }else if(tableName == 'User_field'){
        let module = {};
        module = await baseService.getIdAndName('Module');
        args = {
            module:module
        }
    }
    try{
        records = await domain.findAll(where,{ offset: offset, limit: limit });
        for (let i = 0; i < records.length; i++) {
            let record = records[i];
            if(tableName == 'Module'){
                if(record.parent_module_id){
                    record.parent_module = args.module ? args.module[record.parent_module_id] : '';
                }
                if(record.read_db_id){
                    record.read_db = args.dbconfig ? args.dbconfig[record.read_db_id] : '';
                }
                if(record.write_db_id){
                    record.write_db = args.dbconfig ? args.dbconfig[record.write_db_id] : '';
                }
                if(record.pull_api_id){
                    record.pull_api = args.apiconfig ? args.apiconfig[record.pull_api_id] : '';
                }
                if(record.send_api_id){
                    record.send_api = args.apiconfig ? args.apiconfig[record.send_api_id] : '';
                }
            }
            if(tableName == 'User_field'){
                if(record.module_id){
                    record.module = args.module ? args.module[record.module_id] : '';
                }
            }
        }
        count = await domain.count(where);
    }catch(error){
        log.info(error);
    }finally{
        res.json({
            code:0,
            msg:'查询成功',
            count:count,
            data:records
        })
    };
});

/**
 * 统一保存
 */
router.get('/save', async (req, res) => {
    var params = req.query;
    var tableName = params.tableName;
    var p = {};
    for (var key in params) {
        if (key != 'tableName') {
            p[key] = params[key];
        }
    }
    console.log(tableName,p);
    const domain = models[tableName];
    let record =  Object.assign({},p);
    for (const key in record) {
        if (Object.hasOwnProperty.call(record, key)) {
            const val = record[key];
            if(!val || val == '' || val == 'null'){
                delete record[key];
            }
        }
    }
    delete record.id;
    if(p.id){
        await domain.update(record,{where:{id:p.id}});
    }else{
        await domain.create(record);
    }
    let json = {code:0,msg:'保存成功'};
    switch (tableName) {
        case 'Module':
            moduleService.refreshData();
            break;
        case 'Db_config':
            dbConfigService.refreshData();
            break;
        case 'User_field':
            userFieldService.refreshData();
            break;
        case 'Project':
            projectService.refreshData();
            break;
        case 'dataDict':
            dataDictService.refreshData();
            break;
        case 'Api_config':
            apiConfigService.refreshData();
            break;
        default:
            break;
    }
    res.json(json);
})

router.get('/rebuild',async (req,res)=>{
    const params = req.query;
    const id = params.id;
    const msg = await baseService.rebuild(id);
    res.json({
        code:0,
        msg:msg
    })
})

module.exports = router;