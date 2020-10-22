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
    listener_port                       : 'string',
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
    project_id                          : 'int@project#project',
    name                                : 'string',
    moduleId                            : 'string',
    kind                                : 'int',
    table_name                          : 'string',
    read_db_id                          : 'int@dbConfig#read_db',
    write_db_id                         : 'int@~dbConfig#write_db',
    send_api_id                         : 'int@apiConfig#send_api',
    polling_mode                        : 'int',
    interval_                           : 'string',
}

module.exports = domain;