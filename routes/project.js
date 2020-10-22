var express = require("express");
var router = express.Router();
var mysql = require('../utils/mysql');
var saveInfo = require('../utils/saveInfo');


var project = {};

router.use('/list', (req, res) => {
    res.render('./project/list.html');
});

router.use('/searchList', (req, res) => {
    var sql = `select * from project where deleteFlag = 0`;
    mysql.query(sql).then(re => {
        res.json({
            code: 0,
            msg: '查询成功',
            data: re
        })
    }).catch(err => {
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
        res.json({
            code: 0,
            msg: '保存失败'
        })
    })
});

module.exports = router;