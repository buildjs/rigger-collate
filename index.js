var fs = require('fs'),
    path = require('path'),
    walk = require('walkdir'),
    seq = require('seq'),
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
    
    Object.keys(collated).forEach(function(key) {
        lines.push('  \'' + key + '\': \'' + collated[key] + '\'');
    });
    
    return 'var ' + varName + ' = {\n' + lines.join(',\n') + '\n};\n';
}

exports = module.exports = function(rigger, targetPath, varName) {

    var finder, files = [], collated = {},
        scope = this;
    
    // resolve the target path
    targetPath = rigger.resolve(targetPath || 'resources');
    
    // initialise the variable name to match the name of the target directory
    varName = (varName || path.basename(targetPath)).replace(/\-/g, '_');
    
    // find the finder
    finder = walk(targetPath);
        
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
                
                // remove line breaks between tags 
                data = data.replace(reLineBreakSeparatedTags, '$1$2');
                
                // replace remaining line breaks with spaces
                data = data.replace(reLineBreaks,  ' ');
                
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