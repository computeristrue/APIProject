var express = require('express');
var router = express.Router();

var dict = require('../utils/dataDict');

router.get('/searchDict',(req,res)=>{
    var params = req.query;
    var dictIds = params.dictIds;
    dictIds = dictIds.split(',')
    console.log(dictIds);
    var json = {};
    var fn = [];
    for(var i = 0;i<dictIds.length;i++){
        var item = dictIds[i];
        item = item.split('&')[1];
        console.log(item);
        fn.push(dict.get(item));
    }
    Promise.all(fn).then(re=>{
        for(var i = 0;i<dictIds.length;i++){
            var objId = dictIds[i].split('&')[0]
            console.log(objId);
            json[objId] = re[i];
        }
        res.json(json);
    });
});

module.exports = router;