const log = require('./log').logger;

const groupArray = (array, len) => {
    var index = 0;
    var newArray = [];
    while (index < array.length) {
        newArray.push(array.slice(index, index += len));
    };
    return newArray;
}

const sleep = (numberMillis) => {
    var now = new Date();
    var exitTime = now.getTime() + numberMillis;
    while (true) {
        now = new Date();
        if (now.getTime() > exitTime)
            return;
    }
}

module.exports = {
    groupArray: groupArray,
    sleep:sleep
}