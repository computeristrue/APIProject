CREATE DATABASE IF NOT EXISTS api default charset utf8 COLLATE utf8_general_ci;

use api;

--项目表
create table if not exists project (
    id int not null auto_increment PRIMARY KEY,
    name VARCHAR(30) not null,
    host VARCHAR(30) not null, --CRM数据库配置
    user VARCHAR(30) not null,
    password VARCHAR(30) not null,
    port VARCHAR(30),
    database VARCHAR(30) not null,
    kind int not null, --数据库类型 1、MySQL 2、SQL service
    url VARCHAR(255) not null, --CRM域名
    authToken VARCHAR(50) not null --CRM的authToken
);

--模块表
create table if not exists module(
    id int not null auto_increment PRIMARY KEY,
    project_id int not null,
    name VARCHAR(30) not null,
    moduleId VARCHAR(30) not null,
    kind int not null, --模块类型 1、推送 2、拉取
    table_name VARCHAR(30) not null, --该模块默认关联的CRM表
    read_db_id int, --读取信息所用数据库
    write_db_id int, --写入信息所用数据库
    send_api_id int, --推送信息所用接口
    polling_mode int, --拉取信息的轮询方式 1、间隔X毫秒拉取 2、固定时间点拉取
    interval VARCHAR(30) --间隔时间
)

--字段表
create table if not exists field(
    id int not null auto_increment PRIMARY KEY,
    project_id int not null,
    module_id int not null,
    orgin_field VARCHAR(50) not null, --原字段
    target_field VARCHAR(50) not null,--目标字段  根据之后选择的各种属性按照约定拼接而成
    is_weiyi int not null, --是否作为唯一标识 1、是 2、否
    is_default int not null, --是否默认值 1、是 2、否
    is_dict int not null, --是否数据字典 1、是 2、否
    is_double int not null, --是否数值字段 1、是 2、否
    is_date int not null, --是否时间类型字段 1、是 2、否
    dict_id int, --关联数据字典ID
    default_field VARCHAR(50), --默认值
    decimal_place int, --小数位数
    sdf VARCHAR(30), --日期格式化
    table_name VARCHAR(30) --关联的表，带点字段需填写关联的CRM表名
)

--数据库配置表
create table if not exists dbConfig(
    id int not null auto_increment PRIMARY KEY,
    project_id int not null,
    name VARCHAR(30) not null,
    host VARCHAR(30) not null,
    user VARCHAR(30) not null,
    password VARCHAR(30) not null,
    port VARCHAR(30),
    database VARCHAR(30) not null,
    kind int not null, --数据库类型 1、MySQL 2、SQL service
    remark VARCHAR(255)
)

--接口配置表
create table if not exists apiConfig(
    id int not null auto_increment PRIMARY KEY,
    project_id int not null,
    name VARCHAR(30) not null,
    url VARCHAR(255) not null,
    method int not null, --接口提交方式 1、post 2、get
    type int not null --数据包装方式 1、json 2、xml
)