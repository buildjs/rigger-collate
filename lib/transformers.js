var reStripChars = /(^\s+|\s+$)/mg,
    reLineBreakSeparatedTags = /(\>|\})[\n\r]+(<|\{)/g,
    reUnescapedSingleQuotes = /(?!\\)\'/g,
    reLineBreaks = /[\n\r]/g;

/*
## array transformer

The array transformer splits the input string on linebreak characters and creates an array
object that is rejoined at runtime using the line break character
*/
exports.array = function(input, opts) {
    return '[\'' + input.split(/\r?\n/).join('\',\'') + '\'].join(\'\\n\')';
};

/**
## stripWhitespace transformer

This transformer takes the input string and converts it to a single-line stripped 
whitespace equivalent.  This is generally suitable for html, js, etc data but not
for whitespace sensitive files.  These files should use the array transformer.
*/
exports.stripWhitespace = function(input, opts) {
    var output = input

        // fix unescaped single quotes
        .replace(reUnescapedSingleQuotes, '"')

        // remove line breaks from the string
        .replace(reStripChars, '')

        // remove line breaks between tags
        .replace(reLineBreakSeparatedTags, '$1$2')

        // replace remaining line breaks with spaces
        .replace(reLineBreaks,  ' ');

    return '\'' + output + '\'';
};