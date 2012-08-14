var async = require('async'),
    fs = require('fs'),
    path = require('path'),
    readdirp = require('readdirp'),
    reStripExt = /(.*)\..*$/,
    reStripChars = /(^\s+|\s+$)/mg,
    reLineBreakSeparatedTags = /(\>|\})[\n\r]+(<|\{)/g,
    reLineBreaks = /[\n\r]/g,
    reUnescapedSingleQuotes = /(?!\\)\'/g;
    
function _makeJS(collated, varName) {
    var lines = [];
        
    // ensure we have a varname
    varName = varName || 'collated';
    if (varName[0] !== '_') {
        varName = '_' + varName;
    }
    
    Object.keys(collated).sort().forEach(function(key) {
        lines.push('  \'' + key + '\': \'' + collated[key] + '\'');
    });
    
    return 'var ' + varName + ' = {\n' + lines.join(',\n') + '\n};\n';
}

exports = module.exports = function(rigger, targetPath, varName) {

    var finder, files = [], collated = {},
        scope = this;

    function readFile(file, callback) {
        var filename = file.fullPath;

        fs.readFile(filename, 'utf8', function(err, data) {
            var itemName = filename.slice(targetPath.length + 1).replace(reStripExt, '$1'),
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
    varName = (varName || path.basename(targetPath)).replace(/\-/g, '_');
    
    readdirp({ root: targetPath }, function(err, res) {
        if (err) return scope.done(err);

        async.forEach(res.files, readFile, function(err) {
            scope.done(err, err ? null : _makeJS(collated, varName));
        });
    });
};