var mysql = require('./mysql');
const models = require('../model');

var dict = {};

dict.get = async function (tableName) {
    let obj = {};
    try {
        const domain = models[tableName];
        const records = await domain.findAll({ 'order': [['name', 'asc']] });
        for (let i = 0; i < records.length; i++) {
            const record = records[i];
            if (!record) continue;
            obj[record.id] = record.name;
        }
    } catch (error) {
        log.info(error);
    } finally {
        return obj;
    };
}

dict.getLink = function (tableName, link, linkId) {
    var condition = `where deleteFlag = 0`;
    if (link && linkId) {
        condition += ` and ${link} = ${linkId}`;
    }
    var sql = `select id,name from ${tableName} ${condition} order by name`;
    var obj = {};
    console.log(sql);
    return new Promise((resolve, reject) => {
        mysql.query(sql).then(re => {
            for (var i = 0; i < re.length; i++) {
                var item = re[i];
                obj[item.id] = item.name;
            }
            resolve(obj);
        }).catch(err => {
            reject(err);
        });
    });
}


module.exports = dict;