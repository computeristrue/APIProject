var express = require('express');
var router = express.Router();

var dict = require('../utils/dataDict');

router.get('/searchDict',(req,res)=>{
    var params = req.query;
    var dictIds = params.dictIds;
    dictIds = dictIds.split(',')
    var json = {};
    var fn = [];
    for(var i = 0;i<dictIds.length;i++){
        var item = dictIds[i];
        item = item.split('&')[1];
        fn.push(dict.get(item));
    }
    Promise.all(fn).then(re=>{
        for(var i = 0;i<dictIds.length;i++){
            var objId = dictIds[i].split('&')[0]
            json[objId] = re[i];
        }
        res.json(json);
    }).catch(err=>{
        res.json({});
    });
});

router.get('/linkDict',(req,res)=>{
    var params = req.query;
    var tableName = params.t,link = params.link,linkId = params.linkId;
    dict.getLink(tableName,link,linkId).then(re=>{
        console.log(re);
        res.json(re);
    }).catch(err=>{
        res.json({});
    });
})

module.exports = router;