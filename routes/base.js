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

/**
 * 统一删除
 */
router.get('/del', async (req, res) => {
    var params = req.query;
    var id = params.id, tableName = params.tableName;
    var json = await baseService.delete(id, tableName);
    res.json(json);
});

/**
 * 统一查询
 */
router.get('/searchList', async (req, res) => {
    var params = req.query;
    var tableName = params.tableName;
    var moduleId = params.moduleId;
    var condition = "";
    if(tableName == 'userField' && moduleId){
        condition += ` and userField.module_id = ${moduleId}`;
    }
    var records = await baseService.searchList(params,condition);
    var total = await baseService.searchCount(params,condition);
    res.json({
        code: 0,
        msg: '查询成功',
        count: total,
        data: records
    })
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
    var json = await baseService.save(p, tableName);
    switch (tableName) {
        case 'module':
            moduleService.refreshData();
            break;
        case 'dbConfig':
            dbConfigService.refreshData();
            break;
        case 'userField':
            userFieldService.refreshData();
            break;
        case 'project':
            projectService.refreshData();
            break;
        case 'dataDict':
            dataDictService.refreshData();
            break;
        case 'apiConfig':
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