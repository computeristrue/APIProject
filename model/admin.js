module.exports = (sequelize,DataTypes)=>{
    return sequelize.define('api_admin', {
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
        account:{
            type:DataTypes.STRING,
            allowNull: false,
            unique:true
        },
        password:{
            type:DataTypes.STRING,
            allowNull: false
        },
        kind:{
            type:DataTypes.INTEGER,
            allowNull: false
        }
    });
};