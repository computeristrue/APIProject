var express = require("express");
var router = express.Router();
var mysql = require('../utils/mysql');
var saveInfo = require('../utils/saveInfo');
var pcon = require('../task/projectCon');
var path = require('path');
var compressing = require('compressing');
var fs = require('fs');


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

router.get('/reBuild', (req, res) => {
    var params = req.query;
    var project_id = params.project_id;
    var sql = `select name,path from project where id = ${project_id}`;
    var src = "", dst = "";
    src = path.join(__dirname, '../public/module');
    console.log(src);
    mysql.query(sql).then(re => {
        if (re && re.length > 0) {
            var targetDir = path.join(__dirname,`../target`);
            if(!fs.existsSync(targetDir)){
                fs.mkdirSync(targetDir);
            }
            dst = path.join(targetDir,`${re[0].name}`);
            dst = pcon.copy(src, dst);
            console.log(dst);
            pcon.reJson(dst, project_id);
            pcon.reFt(dst,project_id);
            var finalFileName = path.basename(dst);
            var zipDir = path.join(__dirname,`../zipDir`);
            if(!fs.existsSync(zipDir)){
                fs.mkdirSync(zipDir);
            }
            var zipFile = path.join(zipDir,`${finalFileName}.zip`);
            compressing.zip.compressDir(dst,zipFile).then(()=>{
                res.json({
                    code: 0,
                    url: zipFile,
                    name:re[0].name
                });
            })
        }
    }).catch(err => {
        console.log(err);
        res.json({
            code: 1,
            msg: '生成文件失败'
        })
    });
})

module.exports = router;