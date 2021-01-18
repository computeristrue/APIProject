var fs = require('fs');
var stat = fs.statSync
var log = require('../utils/log').logger;
var moment = require('moment');


var pcon = {};

/**
 * 复制文件夹
 */
pcon.copy = function (src, dst, unique = true) {
    if (!fs.existsSync(dst)) {
        fs.mkdirSync(dst);
    } else if (unique) {
        dst = dst.split('_')[0];
        dst = `${dst}_${moment().format('YYYYMMDDHHmmssSSS')}`;
        fs.mkdirSync(dst);
    }
    var paths = fs.readdirSync(src);
    paths.forEach(path => {
        var _src = `${src}/${path}`;
        var _dst = `${dst}/${path}`;
        var st = stat(_src);
        if (st.isFile()) {
            fs.writeFileSync(_dst, fs.readFileSync(_src));
        } else if (st.isDirectory()) {
            pcon.exists(_src, _dst, pcon.copy);
        }
    });
}

pcon.exists = function (src, dst, callback) {
    var exists = fs.existsSync(dst);
    if (exists) {
        callback(src, dst,false);
    } else {
        fs.mkdirSync(dst);
        callback(src, dst,false);
    }
}

// pcon.copy("E:/APIProject/public/module", "E:/APIProject/public/temp");



module.exports = pcon;