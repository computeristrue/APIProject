var fs = require('fs');

var file = 'config.json';
var result = JSON.parse(fs.readFileSync(file));
exports.config = result;