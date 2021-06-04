const Sequelize = require('sequelize');
const config = require('./config').config;
const type = config.dbType;
const dbInfo = config.db[type];
let dialect = type == 'sqlServer' ? 'mssql' : type;
const mysql = new Sequelize(dbInfo.database, dbInfo.user, dbInfo.password, {
    host: dbInfo.host,
    dialect: dialect,//方言类型
    logging: false,//输出sql语句
    timezone: '+08:00',//时区设置
    dialectOptions: {//方言的操作
        dateStrings: true,
        typeCast: true,
    },
    pool: {//连接池
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    define: {
        timestamps: true,//使用自动时间
        paranoid: true,//使用删除时间
        freezeTableName: true,//设置为true则不会自动修改表名为复数
        underscored: true,//系统自动字段为下划线
        createdAt: 'date_created',//false为去掉这个字段，string为重命名
        updatedAt: 'last_updated',//false为去掉这个字段，string为重命名
        deletedAt: 'date_deleted'//false为去掉这个字段，string为重命名
    },
    query: {
        raw: true//查询时直接返回数据，不返回DAO
    }
})

const mssql = new Sequelize(dbInfo.database, dbInfo.user, dbInfo.password, {
    host: dbInfo.server,
    dialect: dialect,
    logging: false,
    timezone: '+08:00',
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    define: {
        timestamps: true,
        paranoid: true,
        freezeTableName: true,
        underscored: true,
        createdAt: 'date_created',
        updatedAt: 'last_updated',
        deletedAt: 'date_deleted'
    },
    query: {
        raw: true
    }
})

module.exports = {
    Sequelize: Sequelize,
    mysql: mysql,
    mssql: mssql
};