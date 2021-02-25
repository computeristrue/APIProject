var express = require("express");
var router = express.Router();
var fs = require('fs');

var indexRouter = require('./index');
var commandRouter = require('./command');
var monitRouter = require('./monit');
var projectRouter = require('./project');
var adminRouter = require('./admin');
var moduleRouter = require('./module');
var dictRouter = require('./dict');
var baseRouter = require('./base');
var userFieldRouter = require('./userField');
var dbConfigRouter = require('./dbConfig');

router.use('/', indexRouter);

/**
 * 匹配以/list结尾的URL并渲染对应页面
 */
router.get(/\/list$/,(req,res)=>{
    var url = req.url;
    if(url.startsWith('/')){
        url = url.substring(1,url.length);
    }
    res.render(url);
});

/**
 * base
 * 处理简单的增删改查
 */
router.use('/base',baseRouter);

/**
 * 帮助文档
 */
router.use('/help/index', (req, res) => {
    res.render('./help/index.html');
});

/**
 * 系统命令
 */
router.use('/sys',commandRouter);

/**
 * 进程监控
 */
router.use('/monit',monitRouter);

/**
 * 项目管理
 */
router.use('/project',projectRouter);

/**
 * 用户管理
 */
router.use('/admin',adminRouter);

// /**
//  * 模块管理
//  */
// router.use('/module',moduleRouter);

/**
 * 数据字典
 */
router.use('/dict',dictRouter);

// /**
//  * 字段管理
//  */
// router.use('/userField',userFieldRouter);

// /**
//  * 数据库管理
//  */
// router.use('/dbConfig',dbConfigRouter);

/**
 * 下载文件，name,url
 */
router.get('/download', (req, res) => {
    try {
        var params = req.query;
        var name = params.name, url = params.url;
        var size = fs.statSync(url).size;
        var f = fs.createReadStream(url);
        res.writeHead(200, {
            'Content-Type': 'application/force-download',
            'Content-Disposition': 'attachment; filename=' + encodeURIComponent(name),
            'Content-Length': size
        });
        f.pipe(res);
    } catch (e) {
        console.log(e);
    }
});




module.exports = router;