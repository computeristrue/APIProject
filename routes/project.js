var express = require("express");
var router = express.Router();
var mysql = require('../utils/mysql');
var saveInfo = require('../utils/saveInfo');


var project = {};

router.use('/list', (req, res) => {
    res.render('./project/list.html');
});

router.use('/searchList', (req, res) => {
    var sql = `select * from project`;
    mysql.query(sql).then(re => {
        res.json({
            code: 0,
            msg: '查询成功',
            data: re
        })
    }).catch(err => {
        console.log(err);
        res.json({
            code: 0,
            msg: '查询失败'
        })
    })
});

router.use('/save', (req, res) => {
    var params = req.query;
    var sql = saveInfo(params, { id: 'int', kind: 'int' }, 'project');
    mysql.query(sql).then(re => {
        res.json({
            code: 0,
            msg: '保存成功'
        })
    }).catch(err => {
        console.log(err);
        res.json({
            code: 0,
            msg: '保存失败'
        })
    })
});

router.use('/del',(req,res)=>{
    var params = req.query;
    var id = params.id;
    var sql = `update project set delete_flag = 1 where id = ${id}`;
    mysql.query(sql).then(re=>{
        res.json({
            code: 0,
            msg: '删除成功'
        })
    }).catch(err=>{
        res.json({
            code: 0,
            msg: '删除失败'
        })
    })
})


module.exports = router;