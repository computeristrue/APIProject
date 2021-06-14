var express = require('express');
var router = express.Router();

var dict = require('../utils/dataDict');

/**
 * 查询关联表的ID和name
 */
router.get('/searchDict',async (req,res)=>{
    var params = req.query;
    var dictIds = params.dictIds;
    dictIds = dictIds.split(',')
    var json = {};
    for(var i = 0;i<dictIds.length;i++){
        var item = dictIds[i];
        const arr = item.split('&');
        const tableName = arr[1];
        const dictArr = await dict.get(tableName);
        const objId = arr[0];
        json[objId] = dictArr;
    }
    res.json(json);
});

// router.get('/linkDict',(req,res)=>{
//     var params = req.query;
//     var tableName = params.t,link = params.link,linkId = params.linkId;
//     dict.getLink(tableName,link,linkId).then(re=>{
//         console.log(re);
//         res.json(re);
//     }).catch(err=>{
//         res.json({});
//     });
// })

module.exports = router;