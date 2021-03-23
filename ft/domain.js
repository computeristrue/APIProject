var domain = {};

/**
 * 右排规则: 字段类型@表名#别名
 * 同一个表中关联了两个相同表的话，在后面的表名前加上~
 * 查询时默认查询关联表的name值
 */

 /**
  * 项目表
  */
domain.project = {
    id                                  : 'int',
    name                                : 'string',
    path                                : 'string',
    host                                : 'string',
    user                                : 'string',
    password                            : 'string',
    port                                : 'string',
    database_                           : 'string',
    kind                                : 'int',
    url                                 : 'string',
    authToken                           : 'string'
}

/**
 * 模块表
 */
domain.module = {
    id                                  : 'int',
    name                                : 'string',
    moduleId                            : 'string',
    is_child                            : 'int',
    parent_module_id                    : 'int@module#parent_module',
    kind                                : 'int',
    table_name                          : 'string',
    read_db_id                          : 'int@dbConfig#read_db',
    write_db_id                         : 'int@dbConfig#write_db',
    pull_api_id                         : 'int@apiConfig#pull_api',
    send_api_id                         : 'int@apiConfig#send_api',
    polling_mode                        : 'int',
    interval_                           : 'string',
}

/**
 * 字段表
 */
domain.userField = {
    id                                  : "int",
    module_id                           : "int@module#module",
    orgin_field                         : "string",
    target_field                        : "string",
    is_weiyi                            : "int",
    is_default                          : "int",
    is_dict                             : "int",
    is_double                           : "int",
    is_date                             : "int",
    dict_id                             : "int@dataDict#dict",
    dict_text                           : "string",
    dict_val                            : 'string',
    default_field                       : "string",
    decimal_place                       : "int",
    sdf                                 : "string",
    table_name                          : "string"
}

/**
 * 数据库配置表
 */
domain.dbConfig = {
    id                                  : "int",
    name                                : "string",
    host                                : "string",
    user                                : 'string',
    password                            : 'string',
    port                                : "string",
    database_                           : "string",
    kind                                : 'int',
    remark                              : 'string'
}

/**
 * 接口配置表
 */
domain.apiConfig ={
    id                                  : 'int',
    name                                : 'string',
    url                                 : 'string',
    method                              : 'int',
    type                                : 'int',
    data_place                          : 'string',
    success_place                       : 'string',
    success_val                         : 'string'
}


/**
 * 数据字典表
 */
domain.dataDict = {
    id                                  : "int",
    name                                : "string",
    dataId                              : "string"
}

module.exports = domain;