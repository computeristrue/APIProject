var express = require('express');
var router = express.Router();
var mysql = require('../utils/mysql');
var base = require('../utils/base');

router.get('/list', (req, res) => {
    res.render('userField/list.html');
});


module.exports = router;