var express = require('express');
var router = express.Router();

router.get('/list',(req,res)=>{
    res.render('dbConfig/list');
});


module.exports = router;