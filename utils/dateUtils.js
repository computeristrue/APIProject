var moment = require('moment');


var dateUtils = {};
dateUtils.formatter = "YYYY-MM-DD HH:mm:ss";


dateUtils.toString = function(time,formatter = dateUtils.formatter){
    return moment(time).format(formatter);
}



module.exports = dateUtils;