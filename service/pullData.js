const log = require('../utils/log').logger;
const baseUtils = require('../utils/baseUtils');
const readData = require('./readData');
const writeData = require('./writeData');


module.exports = async (moduleId, id = null) => {
    try {
        const result = await readData(moduleId, id);
        let newArr = baseUtils.groupArray(result, 2000);
        for (let i = 0; i < newArr.length; i++) {
            const arr = newArr[i];
            for (let j = 0; j < arr.length; j++) {
                const record = arr[j];
                let syncResult = 0;
                syncResult = await writeData(moduleId, record, id);
            }
        }
    } catch (error) {
        log.info(error);
    };
}