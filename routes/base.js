var express = require('express');
var router = express.Router();
var mysql = require('../utils/mysql');
var base = require('../utils/base');

/**
 * 统一删除
 */
router.get('/del',(req,res)=>{
    var params = req.query;
    var id = params.id,tableName = params.tableName;
    var sql = `update ${tableName} set deleteFlag = 1 where id = ${id}`;
    var json = {code:0,msg:'删除成功'};
    mysql.query(sql).catch(err=>{
        json = {code: 0,msg: '删除失败'};
    }).finally(()=>{
        res.json(json);
    })
});

/**
 * 统一查询
 */
router.get('/searchList',(req,res)=>{
    var params = req.query;
    var tableName = params.tableName;
    var page = params.page, limit = params.limit;
    var pageCondition = ` limit ${(page - 1) * limit},${limit}`;
    var sql = base.list(tableName,pageCondition);
    var cSql = base.count(tableName);
    var json = {};
    Promise.all([mysql.query(sql),mysql.query(cSql)]).then(re=>{
        var records = re[0],total = re[1] ? re[1][0].total : 0;
        json = {
            code:0,
            msg:'查询成功',
            count:total,
            data:records
        };
    }).catch(err=>{
        json = {code:0,msg:'查询失败',count:0,data:[]}
    }).finally(()=>{
        res.json(json);
    })
});

/**
 * 统一保存
 */
router.get('/save',(req,res)=>{
    var params = req.query;
    var tableName = params.tableName;
    var param = params.param;
    var sql = base.save(param,tableName);
    var json = {code:0,msg:'保存成功'};
    mysql.query(sql).catch(err=>{
        json = {code:0,msg:'保存失败'};
    }).finally(()=>{
        res.json(json);
    })
})

module.exports = router;