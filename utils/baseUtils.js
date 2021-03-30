const log = require('./log').logger;

const groupArray = (array,len)=>{
    var index = 0;
    var newArray = [];
    while (index < array.length) {
        newArray.push(array.slice(index, index += len));
    };
    return newArray;
}

module.exports = {
    groupArray:groupArray
}