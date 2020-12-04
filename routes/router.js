var express = require("express");
var router = express.Router();

var indexRouter = require('./index');
var commandRouter = require('./command');
var monitRouter = require('./monit');
var projectRouter = require('./project');
var adminRouter = require('./admin');
var moduleRouter = require('./module');
var dictRouter = require('./dict');
var baseRouter = require('./base');
var userFieldRouter = require('./userField');

router.use('/', indexRouter);

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
 * 模块管理
 */
router.use('/module',moduleRouter);

/**
 * 数据字典
 */
router.use('/dict',dictRouter);

/**
 * base
 */
router.use('/base',baseRouter);

/**
 * 字段管理
 */
router.use('/userField',userFieldRouter);





module.exports = router;