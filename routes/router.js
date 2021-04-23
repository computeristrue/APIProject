var express = require("express");
var router = express.Router();
var fs = require('fs');

var indexRouter = require('./index');
var commandRouter = require('./command');
var monitRouter = require('./monit');
var projectRouter = require('./project');
var adminRouter = require('./admin');
var dictRouter = require('./dict');
var baseRouter = require('./base');
var syncService = require('../service/syncService');
var moduleService = require('../service/moduleService');
const userFieldService = require("../service/userFieldService");
const dataDictService = require("../service/dataDictService");

router.use('/', indexRouter);

router.get('/u',(req,res)=>{
    res.render('index');
})

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

/**
 * 数据字典
 */
router.use('/dict',dictRouter);


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


router.get('/getModule',moduleService.getModule);

router.get('/getDict',dataDictService.getDict);


/**
 * API级联更新
 */
router.post('/autoSync', syncService.autoSync);

/**
 * 手动触发
 */
router.get('/manualSync',syncService.manualSync);




module.exports = router;