var async = require('async'),
    fs = require('fs'),
    path = require('path'),
    readdirp = require('readdirp'),
    reStripExt = /(.*)\..*$/,
    reStripChars = /(^\s+|\s+$)/mg,
    reLineBreakSeparatedTags = /(\>|\})[\n\r]+(<|\{)/g,

    // intialise line endings based on platform
    lineEnding = process.platform == 'win32' ? '\r\n' : '\n',
    reLineBreaks = /[\n\r]/g,

    reBackslash = /\\/g,
    reUnescapedSingleQuotes = /(?!\\)\'/g;
    
function _makeJS(collated, opts) {
    var lines = [],
        varName = opts.varname || 'collated';
        
    varName = varName || 'collated';
    if (varName[0] !== '_') {
        varName = '_' + varName;
    }
    
    Object.keys(collated).sort().forEach(function(key) {
        lines.push('  \'' + key + '\': \'' + collated[key] + '\'');
    });
    
    return 'var ' + varName + ' = {' + lineEnding +
        lines.join(',' + lineEnding) + lineEnding + 
        '};' + lineEnding;
}

exports = module.exports = function(rigger, targetPath, opts) {

    var finder, files = [], collated = {},
        scope = this;

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

    function readFile(file, callback) {
        var filename = file.fullPath;

        fs.readFile(filename, 'utf8', function(err, data) {
            var itemName = filename.slice(targetPath.length + 1).replace(reStripExt, '$1').replace(reBackslash, '/'),
                stripMatch;
                
            // if we hit an error, abort
            if (err) return callback(err);
            
            // fix unescaped single quotes
            data = data.replace(reUnescapedSingleQuotes, '"');
            
            // remove line breaks from the string
            data = data.replace(reStripChars, '');
            
            // remove line breaks between tags 
            data = data.replace(reLineBreakSeparatedTags, '$1$2');
            
            // replace remaining line breaks with spaces
            data = data.replace(reLineBreaks,  ' ');
            
            // update the collated itemname
            collated[itemName] = data;
            
            callback();
        });
    }
    
    // resolve the target path
    targetPath = rigger.resolve(targetPath || 'resources');
    
    // initialise the variable name to match the name of the target directory
    opts.varname = (opts.varname || path.basename(targetPath)).replace(/\-/g, '_');
    
    readdirp({ root: targetPath }, function(err, res) {
        if (err) return scope.done(err);

        async.forEach(res.files, readFile, function(err) {
            scope.done(err, err ? null : _makeJS(collated, opts));
        });
    });
};