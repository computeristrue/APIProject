const log4js = require('log4js');
log4js.configure({
    appenders: {
        console:{
            type: 'console',
            category: "console",
        },
        log: {
            type: "dateFile",
            filename: 'logs/log.log',
            pattern: "_yyyy-MM-dd",
            alwaysIncludePattern: false,
            category: 'log'
        }
    },
    categories: {
        default: {
            appenders: ['console','log'],
            level: 'info'
        }
    }
});

const logger = log4js.getLogger('log');
exports.logger = logger;