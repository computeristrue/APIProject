module.exports = (sequelize,DataTypes)=>{
    return sequelize.define('api_project', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique:true
        },
        path:{
            type:DataTypes.STRING,
            allowNull: false
        },
        host:{
            type:DataTypes.INTEGER,
            allowNull: false
        },
        user:{
            type:DataTypes.STRING,
            allowNull: false
        },
        password:{
            type:DataTypes.STRING,
            allowNull: false
        },
        port:{
            type:DataTypes.STRING
        },
        database_:{
            type:DataTypes.STRING,
            allowNull: false
        },
        kind:{
            type:DataTypes.INTEGER,
            allowNull: false,
            comment:"1、MySQL 2、SQL server"
        },
        url:{
            type:DataTypes.STRING,
            allowNull: false
        },
        authToken:{
            type:DataTypes.STRING,
            allowNull: false
        },
        user_id:{
            type:DataTypes.INTEGER,
            allowNull: false
        },
    });
};