var express = require('express');
var router = express.Router();

/* GET login page. */
router.get('/', function(req, res, next) {
  res.render('admin/login', { title: '登录页' });
});

router.get('/u',(req,res)=>{
  res.render('index',{title:'主页'});
})

module.exports = router;
