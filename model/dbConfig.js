module.exports = (sequelize, DataTypes) => {
    return sequelize.define('api_db_config', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        host: {
            type: DataTypes.STRING,
            allowNull: false
        },
        user: {
            type: DataTypes.STRING,
            allowNull: false
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        port: {
            type: DataTypes.STRING
        },
        database_: {
            type: DataTypes.STRING
        },
        kind: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        remark: {
            type: DataTypes.STRING
        },
        isBasic: {
            type: DataTypes.INTEGER,
            defaultValue: 2
        }
    });
};