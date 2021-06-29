module.exports = (sequelize,DataTypes)=>{
    return sequelize.define('api_demo', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique:"name"
        },
        remark:{
            type:DataTypes.STRING
        },
        age:{
            type:DataTypes.INTEGER,
            defaultValue:25
        },
        la:{
            type:DataTypes.STRING
        }
    });
};