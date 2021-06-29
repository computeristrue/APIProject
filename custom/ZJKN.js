/**
 * 浙江凯恩的配置
 */

module.exports = {
    "db":{
        "crm":{
            "dbType": "mysql",
            "info": {
                "mysql": {
                    "host": "127.0.0.1",
                    "user": "upcrm",
                    "password": "upcrm!@#",
                    "port": 3306,
                    "database": "wbwy"
                }
            }
        },
        "oracle":{
            "user": "ZHC_KAN_CRM",
            "password": "yuAGlq@68a71U9",
            "connectString": "192.168.20.24/keos"
        },
        "mssql":{
            "dbType":"sqlServer",
            "info":{
                "sqlServer":{
                    "server": "192.168.20.33",
                    "user": "sa",
                    "password": "LSkhchx@",
                    "port": 1433,
                    "database": "U9DATA"
                }
            }
        }
    }
}