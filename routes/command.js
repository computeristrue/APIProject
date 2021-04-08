var express = require('express');
var router = express.Router();

var child_process = require('child_process');
var iconv = require('iconv-lite');
var exec = child_process.exec;

var cmd = {};

router.get('/execute', (req, res) => {
    var params = req.query;
    var type = params.type;
    customExecute(type);
    res.json({
        success: true
    })
});


function customExecute(type) {
    var command = "";
    if (type == 1) command = 'pm2 restart APIGateway';//重启项目
    exec(command,(err,stdout,stderr)=>{
        if(err){
            console.log(`命令[${command}]执行错误--->`,err);
        }else{
            console.log(`命令[${command}]输出--->`,stdout);
            if(stderr) console.log(`命令[${command}]输出错误--->`,stderr);
        }
    });
}


module.exports = router;