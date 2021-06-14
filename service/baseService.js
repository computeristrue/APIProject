const moduleService = require('../service/moduleService');
const dbConfigService = require('../service/dbConfigService');
const userFieldService = require('../service/userFieldService');
const projectService = require('../service/projectService');
const taskJobService = require('../service/taskJobService');
const apiConfigService = require('../service/apiConfigService');
const redis = require('../utils/redis');
const models = require('../model');
const Op = require('sequelize').Op;

var me = {};



/**
 * 缓存所有配置信息
 */
me.saveAllInfo = async () => {
    //首先清空当前DB的所有配置信息
    await redis.flushdb();
    await projectService.refreshData();
    await moduleService.refreshData();
    await dbConfigService.refreshData();
    await userFieldService.refreshData();
    // await dataDictService.refreshData();
    await apiConfigService.refreshData();
    const domain = models.Module;
    await domain.update({state:2},{where:{state:{[Op.ne]:2}}});
}

me.rebuild = async (id) => {
    let msg = "";
    let domain = models.Module;
    const record = await domain.findOne({
        where: {
            id: id
        }
    });
    if (record) {
        if (record.state == 1) {
            msg = "模块已执行任务，若要刷新请重启系统";
        } else {
            try {
                await taskJobService.buildJob(record.moduleId);
                await domain.update({ state: 1 }, { where: { id: id } });
                msg = "执行成功";
            } catch (error) {
                log.info(error);
                msg = "模块执行任务失败";
            };
        }
    } else {
        msg = "找不到对应模块";
    }
    return msg;
}

me.getIdAndName = async(tableName)=>{
    const domain = models[tableName];
    let obj = {};
    try{
        const records = await domain.findAll();
        records && records.map(record=>{
            obj[record.id] = record.name;
        });
    }catch(error){
        log.info(error);
    }finally{
        return obj;
    };
}

module.exports = me;