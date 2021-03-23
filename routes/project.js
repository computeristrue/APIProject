var express = require("express");
var router = express.Router();
var projectService = require('../service/projectService');


var project = {};


router.get('/initData', (req, res) => {
    projectService.initData(req,res);
})

module.exports = router;