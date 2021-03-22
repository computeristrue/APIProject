var express = require('express');
var router = express.Router();
var mysql = require('../utils/mysql');
var baseService = require('../service/baseService');
const moduleService = require('../service/moduleService');
const dbConfigService = require('../service/dbConfigService');

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
    var records = await baseService.searchList(params);
    var total = await baseService.searchCount(params);
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
        default:
            break;
    }
    res.json(json);
})

module.exports = router;