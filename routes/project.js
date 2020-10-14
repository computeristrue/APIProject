var express = require("express");
var router = express.Router();
var mysql = require('../utils/mysql');


var project = {};

router.use('/list',(req,res)=>{
    res.render('./project/list.html');
});

router.use('/searchList',(req,res)=>{
    var params = req.query;
    var sql = `select id,name from t_user where delete_flag = false`;
    mysql.query(sql).then(re=>{
        console.log(re);
    }).catch(err=>{
        console.log(err);
    }).finally(()=>{
        res.json({
            code:0,
            msg:'查询成功'
        })
    })
})

router.use('/add',(req,res)=>{
    var params = req.query;
    console.log(params);
    res.json({
        code:0,
        msg:'保存成功'
    })
});


module.exports = router;