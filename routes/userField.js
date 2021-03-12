var express = require('express');
var router = express.Router();
var mysql = require('../utils/mysql');
var base = require('../service/baseService');

router.get('/list', (req, res) => {
    res.render('userField/list.html');
});


module.exports = router;