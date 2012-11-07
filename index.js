var async = require('async'),
    fs = require('fs'),
    path = require('path'),
    readdirp = require('readdirp'),
    _ = require('underscore'),
    transformers = require('./lib/transformers'),
    reStripExt = /(.*)\..*$/,

    // intialise line endings based on platform
    lineEnding = process.platform == 'win32' ? '\r\n' : '\n',
    reBackslash = /\\/g;
    
function _makeJS(collated, opts) {
    var lines = [],
        varName = opts.varname || 'collated';
        
    varName = varName || 'collated';
    if (varName[0] !== '_') {
        varName = '_' + varName;
    }
    
    Object.keys(collated).sort().forEach(function(key) {
        lines.push('  \'' + key + '\': ' + collated[key]);
    });
    
    return 'var ' + varName + ' = {' + lineEnding +
        lines.join(',' + lineEnding) + lineEnding + 
        '};' + lineEnding;
}

exports = module.exports = function(rigger, targetPath, opts) {

    var finder, files = [], collated = {},
        scope = this,
        transformer;

    // if opts is a string, then attempt to parse into a json object
    // if parsing fails, fallback to using as the varname
    if (typeof opts == 'string' || (opts instanceof String)) {
        try {
            opts = JSON.parse(opts);
        }
        catch (e) {
            opts = { varname: opts };
        }
    }

    // ensure we have opts
    opts = opts || {};

    // ensure the opts all have lowercase keys
    Object.keys(opts).forEach(function(key) {
        opts[key.toLowerCase()] = opts[key];
    });

    // initialise the join style
    transformer = transformers[(opts.joinstyle || 'stripWhitespace')] ||
                    transformers.stripWhitespace;

    function readFile(file, callback) {
        var filename = file.fullPath;

        fs.readFile(filename, 'utf8', function(err, data) {
            // if we hit an error, abort
            if (err) return callback(err);

            // add the collated item name to the stream
            collated[file.key] = transformer(data);

            callback();
        });
    }
    
    // resolve the target path
    targetPath = rigger.resolve(targetPath || 'resources');
    
    // initialise the variable name to match the name of the target directory
    opts.varname = (opts.varname || path.basename(targetPath)).replace(/\-/g, '_');
    
    // read all the files from the target root folder
    readdirp({ root: targetPath }, function(err, res) {
        var keyCounts = {};

        if (err) return scope.done(err);

        // initialise the key for each of the files
        res.files.forEach(function(file) {
            file.key = file.fullPath.slice(targetPath.length + 1)
                                .replace(reStripExt, '$1')
                                .replace(reBackslash, '/');

            // record the key in the all keys hash
            keyCounts[file.key] = (keyCounts[file.key] || 0) + 1;
        });

        // iterate through the files again looking for non-unique keys
        res.files.forEach(function(file) {
            // if the key is not unique add the extension to the key
            if (keyCounts[file.key] > 1) {
                file.key += path.extname(file.fullPath);
            }
        });

        async.forEach(res.files, readFile, function(err) {
            scope.done(err, err ? null : _makeJS(collated, opts));
        });
    });
};