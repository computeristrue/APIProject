var express = require("express");
var router = express.Router();
var mysql = require('../utils/mysql');
const models = require('../model');

router.get('/', (req, res) => {
    res.render('admin/login.html');
})

router.get('/login', async (req, res) => {
    var params = req.query;
    var session = req.session;
    var account = params.account, password = params.password;
    const Admin = models.Admin;
    let json = {
        code: 0,
        msg: '登陆成功'
    };
    try {
        const result = await Admin.findOne({
            where: {
                account: account,
                password: password
            }
        });
        if (result) {
            session.user = result.name;
            session.userKind = result.kind;
            json.user = result;
        }else{
            json = {
                code: 1,
                msg: '登陆失败，账号或密码错误'
            };
        }
    } catch (error) {
        log.info(error);
        json = {
            code: 1,
            msg: '登陆失败，服务器异常'
        };
    } finally {
        res.json(json);
    };
});

/**
 * 登出
 */
router.get('/logout', (req, res) => {
    var session = req.session;
    delete session.user;
    delete session.userKind;
    res.json({
        success: true,
        msg: '登出成功'
    })
})

module.exports = router;