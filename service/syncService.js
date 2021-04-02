const log = require('../utils/log').logger;
const redis = require('../utils/redis');
const executeJob = require('../job/executeJob');

const autoSync = async (req, res) => {
    const params = req.body;
    const moduleId = params.moduleId
        , id = params.id
        , opt = params.opt;
    const key = `${moduleId}_${id}`;
    console.log(params);
    const isExist = await redis.get(key);
    if (Number(isExist)) {
        res.json({
            success: false,
            msg: 'Do not repeat submission！'
        })
    } else {
        await sync(params);
        redis.setex(key, 15, 1);
        res.json({
            success: true,
            msg: 'SUCCESS!'
        })
    }
}

const manualSync = async (req, res) => {
    const params = req.query;
    const moduleId = params.moduleId
        , id = params.id
        , opt = params.opt;
    const key = `${moduleId}_${id}`;
    const isExist = await redis.get(key);
    if (Number(isExist)) {
        res.json({
            success: false,
            msg: 'Do not repeat submission！'
        })
    } else {
        await sync(params);
        redis.setex(key, 15, 1);
        res.json({
            success: true,
            msg: 'SUCCESS!'
        })
    }
}

const sync = async (params) => {
    try {
        const moduleId = params.moduleId
            , id = params.id
            , opt = params.opt;
        await executeJob(moduleId, id);
    } catch (error) {
        log.info(error);
    };
}


module.exports = {
    autoSync: autoSync,
    manualSync: manualSync
}