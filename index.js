var fs = require('fs'),
    path = require('path'),
    findit = require('findit'),
    seq = require('seq'),
    reStripExt = /(.*)\..*$/,
    reStripChars = /(^\s+|\s+$)/mg,
    reUnescapedSingleQuotes = /(?!\\)\'/g;
    
function _makeJS(collated, varName) {
    var lines = [];
        
    // ensure we have a varname
    varName = varName || 'collated';
    if (varName[0] !== '_') {
        varName = '_' + varName;
    }
    
    Object.keys(collated).forEach(function(key) {
        lines.push('  \'' + key + '\': \'' + collated[key] + '\'');
    });
    
    return 'var ' + varName + ' = {\n' + lines.join(',\n') + '\n};\n';
}

exports = module.exports = function(rigger, targetPath, varName) {
    var finder, files = [], collated = {},
        scope = this;
    
    // resolve the target path
    targetPath = path.resolve(rigger.cwd, targetPath || 'resources');
    
    // initialise the variable name to match the name of the target directory
    varName = varName || path.basename(targetPath);
    
    // find the finder
    finder = findit.find(targetPath);
        
    function readFile(filename, index) {
        var stack = this;
        
        fs.readFile(filename, 'utf8', function(err, data) {
            var itemName = filename.slice(targetPath.length + 1).replace(reStripExt, '$1'),
                stripMatch;
            
            if (err) {
                throw err;
            }
            else {
                // fix unescaped single quotes
                data = data.replace(reUnescapedSingleQuotes, '"');
                
                // remove line breaks from the string
                data = data.replace(reStripChars, '');
                
                // update the collated itemname
                collated[itemName] = data;
                stack.ok();
            }
        });
    }
    
    finder.on('file', function(file, stat) {
        files.push(file);
    });
    
    finder.on('end', function() {
        seq(files)
            ['catch'](function(err) {
                scope.done(err);
            })
            .parEach(readFile)
            .seq(function() {
                scope.done(null, _makeJS(collated, varName));
            });
    });
};