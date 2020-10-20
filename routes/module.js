var express = require('express');
const mysql = require('../utils/mysql');
var router = express.Router();
var saveInfo = require('../utils/saveInfo');

router.get('/list', (req, res) => {
    res.render('module/list.html');
});

router.get('/searchList', (req, res) => {
    var params = req.query;
    var sql = `select m.*,p.name project
    ,r.name read_db
    ,w.name write_db
    ,a.name send_api
    from module m 
    left join project p on m.project_id = p.id 
    left join dbConfig r on m.read_db_id = r.id
    left join dbConfig w on m.write_db_id = w.id
    left join apiConfig a on m.send_api_id = a.id
    where m.deleteFlag = 0`;
    mysql.query(sql).then(re => {
        res.json({
            code: 0,
            msg: '查询成功',
            count: re.length,
            data: re
        })
    });
});

router.get('/save', (req, res) => {
    var params = req.query;
    var sql = saveInfo(params, { id: 'int', kind: 'int', project_id: 'int', read_db_id: 'int', write_db_id: 'int', send_api_id: 'int', polling_mode: 'int' }, 'module');
    console.log(sql);
    var json = { code: 0, msg: '保存成功' };
    mysql.query(sql).catch(err => {
        json.code = 0;
        json.msg = '保存失败';
    }).finally(() => {
        res.json(json);
    })
});

module.exports = router;