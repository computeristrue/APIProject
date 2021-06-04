module.exports = (sequelize,DataTypes)=>{
    return sequelize.define('api_module', {
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
        moduleId:{
            type:DataTypes.STRING,
            allowNull: false,
            unique:true
        },
        is_child:{
            type:DataTypes.INTEGER
        },
        parent_module_id:{
            type:DataTypes.INTEGER
        },
        kind:{
            type:DataTypes.INTEGER,
            allowNull: false
        },
        table_name:{
            type:DataTypes.STRING
        },
        writeKind:{
            type:DataTypes.INTEGER
        },
        readKind:{
            type:DataTypes.INTEGER
        },
        target_table_name:{
            type:DataTypes.STRING
        },
        // read_db_id:{
        //     type:DataTypes.INTEGER
        // },
        // write_db_id:{
        //     type:DataTypes.INTEGER
        // },
        pull_api_id:{
            type:DataTypes.INTEGER
        },
        send_api_id:{
            type:DataTypes.INTEGER
        },
        polling_mode:{
            type:DataTypes.INTEGER
        },
        hourIndex:{
            type:DataTypes.STRING
        },
        minuteIndex:{
            type:DataTypes.STRING
        },
        interval_:{
            type:DataTypes.STRING
        },
        condition_str:{
            type:DataTypes.STRING
        },
        state:{
            type:DataTypes.INTEGER
        },
        timeField:{
            type:DataTypes.STRING
        },
        timestamp_:{
            type:DataTypes.STRING
        },
        remark:{
            type:DataTypes.STRING
        }
    });
};