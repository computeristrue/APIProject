var express = require("express");
var router = express.Router();

var indexRouter = require('./index');

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

router.post('/autoSync',(req,res)=>{
    //自动触发接口
    CUSTOM_AUTO_SYNC
});


router.get('/manualSync',(req,res)=>{
    //手动触发接口
    CUSTOM_MANUAL_SYNC
});

module.exports = router;