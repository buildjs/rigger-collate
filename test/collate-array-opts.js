var collate = require('../'),
    assert = require('assert'),
    path = require('path'),
    fs = require('fs'),
    rigger = require('./mocks/rigger'),
    _templateComparison;

describe('array transform, using opts', function() {
    before(function(done) {
        fs.readFile(path.resolve(__dirname, '_collated/_templates_array.js'), 'utf8', function(err, data) {
            _templateComparison = data;
            done(err);
        });
    });
    
    it('can collate files', function(done) {
        var scope = {
            done: function(err, output) {
                assert.equal(output, _templateComparison);
                done();
            }
        };
        
        collate.call(scope, rigger, '_templates { "transform": "array" }');
    });
});