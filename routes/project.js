var express = require("express");
var router = express.Router();
var mysql = require('../utils/mysql');
var saveInfo = require('../utils/saveInfo');
var pcon = require('../task/projectCon');
var path = require('path');


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

router.get('/reBuild',(req,res)=>{
    var params = req.query;
    var project_id = params.project_id;
    var sql = `select name,path from project where id = ${project_id}`;
    var src = "",dst = "";
    src = path.join(__dirname,'../public/module');
    console.log(src);
    mysql.query(sql).then(re=>{
        if(re && re.length > 0){
            dst = path.join(__dirname,`../public/${re[0].name}`);
            pcon.copy(src,dst);
            res.json({
                code:0,
                msg:dst
            });
        }
    }).catch(err=>{
        res.json({
            code:1,
            msg:'生成文件失败'
        })
    });
})

module.exports = router;