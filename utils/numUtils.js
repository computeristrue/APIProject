var numUtils = {};

numUtils.parseMemory = function(num){
    return numUtils.formatNumber((num / (1024 * 1024))) + 'MB'
}


numUtils.formatNumber = function(num,scale = 2){
    var re = 0;
    if(num && num != "null" && num != undefined && num != ''){
        if(numUtils.isInteger(num)){
            re = num;
        }else if(numUtils.isFloat(num)){
            re = Number(num).toFixed(scale);
        }else{
            re = num;
        }
    }
    return re;
}

numUtils.isInteger = function(n){
    return parseFloat(n) == parseInt(n);
}

numUtils.isFloat = function(n){
    return parseInt(n) < parseFloat(n);
}


module.exports = numUtils;