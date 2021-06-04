module.exports = (sequelize, DataTypes) => {
    return sequelize.define('api_api_config', {
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
        url: {
            type: DataTypes.STRING,
            allowNull: false
        },
        method: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        headers: {
            type: DataTypes.STRING
        },
        contentType: {
            type: DataTypes.INTEGER,
            allowNull:false
        },
        extraParam: {
            type: DataTypes.STRING(1000)
        },
        recordPlace: {
            type: DataTypes.STRING
        },
        recordKind: {
            type: DataTypes.INTEGER
        },
        data_place: {
            type: DataTypes.STRING,
            allowNull:false
        },
        success_place: {
            type: DataTypes.STRING,
            allowNull:false
        },
        success_val: {
            type: DataTypes.STRING,
            allowNull:false
        }
    });
};