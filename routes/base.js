var express = require('express');
var router = express.Router();
var mysql = require('../utils/mysql');

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

module.exports = router;