const _ = require('lodash');
const config = require('../utils/config').config;
const fs = require('fs');
const path = require('path');
const { Sequelize, mysql, mssql } = require("../utils/sequelize");
var db = {};
let type = config.dbType;

type = type == 'sqlServer' ? 'mssql' : type;
fs.readdirSync(__dirname)
    .filter((file) => {
        return (file.indexOf('.') !== 0) && (file !== 'index.js');
    })
    .forEach((file) => {
        const p = path.join(__dirname, file);
        let model;
        if (type == 'mysql') {
            model = require(p)(mysql, Sequelize.DataTypes);
        } else if (type == 'mssql') {
            model = require(p)(mssql, Sequelize.DataTypes);
        }
        let name = model.name;
        name = name.replace('api_', '');
        db[_.upperFirst(name)] = model;
    });

if (type == 'mysql') {
    db.baseSql = mysql;
} else if (type == 'mssql') {
    db.baseSql = mssql;
}
console.log(Object.keys(db));
/**
 * 添加关联关系
 */
db.Module.belongsTo(db.Db_config,{as :'read_db',foreignKey:'read_db_id'});
db.Module.belongsTo(db.Db_config,{as :'write_db',foreignKey:'write_db_id'});
// db.Player.belongsTo(db.Team, { as: 'team', foreignKey: 'team_id' });
// db.Player.belongsTo(db.Base, { as: 'base', foreignKey: 'base_id' });

// db.M_player.belongsTo(db.M_team, { as: 'team', foreignKey: 'team_id' });
// db.M_player.belongsTo(db.M_base, { as: 'base', foreignKey: 'base_id' });

module.exports = db;