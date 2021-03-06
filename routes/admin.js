var express = require("express");
var router = express.Router();
var mysql = require('../utils/mysql');

router.get('/',(req,res)=>{
    res.render('admin/login.html');
})

router.get('/login',(req,res)=>{
    var params = req.query;
    var session = req.session;
    var account = params.account,password = params.password;
    var sql = `select * from adminUser where deleteFlag = 0 and account = '${account}' and password = '${password}'`;
    var json = {
        code:0,
        msg:'登录成功'
    }
    mysql.query(sql).then(re=>{
        if(re && re.length > 0){
            var record = re[0];
            session.user = record.name;
            session.userKind = record.kind;
            json.user = record;
        }else{
            json.code = 1;
            json.msg = '登录失败，账号或密码错误';
        }
    }).catch(err=>{
        json.code = 1;
        json.msg = '服务器异常，请稍后重试';
    }).finally(()=>{
        res.json(json);
    })
});

/**
 * 登出
 */
router.get('/logout',(req,res)=>{
    var session = req.session;
    delete session.user;
    delete session.userKind;
    res.json({
        success:true,
        msg:'登出成功'
    })
})

module.exports = router;