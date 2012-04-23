var path = require('path');

exports.resolve = function(name) {
    return path.join(path.resolve(__dirname, '../'), name);
};