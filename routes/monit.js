var express = require("express");
var router = express.Router();

var pm2 = require('pm2');
var dateUtils = require('../utils/dateUtils');
var numUtils = require('../utils/numUtils');

var processMonit = {};



/**
 * 基础信息列表
 */
router.get('/list', (req, res) => {
    res.render('./monit/list.html');
});

router.get('/searchList', (req, res) => {
    var data = [];
    pm2.list((err, list) => {
        if (err) {
            console.log(err);
        }
        if (list && list.length > 0) {
            for (var i = 0; i < list.length; i++) {
                var item = list[i];
                var record = {};
                for (var key in item) {
                    if (key != 'pm2_env') {
                        record[key] = item[key];
                        if (key == 'monit') {
                            record['memory'] = numUtils.parseMemory(item[key]['memory']);
                            record['cpu'] = item[key]['cpu'] + '%';
                            delete record['monit'];
                        }
                    } else {
                        var env = item[key];
                        record['restartTime'] = env.restart_time;
                        record['created'] = dateUtils.toString(env.created_at);
                        record['username'] = env.username;
                        record['status'] = env.status;
                        record['outPath'] = env.pm_out_log_path;
                        record['errPath'] = env.pm_err_log_path;
                    }
                }
                data.push(record);
            }
        }
        var total = data.length;
        res.json({
            code: 0,
            msg: '查询成功',
            count: total,
            data: data
        });
    })
});

router.get('/operation',(req,res)=>{
    var params = req.query;
    var type = params.type,name = params.name;
    if(type == 'start' || type == 'restart'){
        pm2.restart(name,(err,proc)=>{
            if(err){
                console.log(err);
            }else{
            }
        })
    }else if(type == 'stop'){
        pm2.stop(name,(err,proc)=>{
            if(err) console.log(err);
        })
    }else if(type == 'del'){
        pm2.delete(name,(err,proc)=>{
            if(err)console.log(err);
        })
    }else if(type =='startup'){
        try {
            pm2.startup('centos',(err,result)=>{
                if(err)console.log(err);
                console.log(result);
            })
        } catch (error) {
            res.json({
                code:0
            })
        }
    }
    res.json({
        code:0
    })
})





module.exports = router;