var express = require("express");
var router = express.Router();

var indexRouter = require('./index');
var commandRouter = require('./command');
var monitRouter = require('./monit');
var projectRouter = require('./project');

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






module.exports = router;