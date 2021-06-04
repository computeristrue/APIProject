const log = require('../utils/log').logger;
const models = require('../model');
const moment = require('moment');

module.exports = () => {
    models.baseSql.sync({alter:true}).finally(async()=>{
        console.log('表字段更新完成');
        const Admin = models.Admin;
        const records = await Admin.findAll({where:{account:'admin'}});
        if(records && records.length > 0){
            // console.log(records);
        }else{
            const admin = await Admin.create({name:"管理员",account:"admin",password:"1",kind:1});
        }
        const Module = models.Module;
        const DbConfig = models.Db_config;
        // const m = await Module.create({
        //     name:'测试Oracle',
        //     moduleId:'Oracle',
        //     is_child:2,
        //     parent_module_id:0,
        //     kind:2,
        //     table_name:'demo',
        //     polling_mode:0
        // });
        // const d = await DbConfig.create({
        //     name:'Oracle',
        //     host:'192.168.0.69/helowin',
        //     user:'zzy',
        //     password:'root',
        //     port:'1521',
        //     kind:3,
        //     remark:'222',
        //     isBasic:1
        // });
        // await m.setRead_db(d);
        // const mRs = await Module.findAll({
        //     where:{
        //         moduleId:'Oracle'
        //     },
        //     include: [{ model: DbConfig,as:'read_db', attributes: ['name'] }]
        // });
        // console.log(mRs[0].dataValues.read_db.name);
    });
}