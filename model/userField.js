module.exports = (sequelize, DataTypes) => {
    return sequelize.define('api_user_field', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        module_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        origin_field: {
            type: DataTypes.STRING,
            allowNull: false
        },
        target_field: {
            type: DataTypes.STRING,
            allowNull: false
        },
        is_weiyi: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        is_default: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        is_dict: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        is_double: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        is_date: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        is_detail: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        dict_id: {
            type: DataTypes.INTEGER
        },
        dict_text: {
            type: DataTypes.STRING
        },
        dict_val: {
            type: DataTypes.STRING
        },
        default_field: {
            type: DataTypes.STRING
        },
        decimal_place: {
            type: DataTypes.INTEGER
        },
        sdf: {
            type: DataTypes.STRING
        },
        table_name: {
            type: DataTypes.STRING
        },
        remark: {
            type: DataTypes.STRING
        }
    });
};