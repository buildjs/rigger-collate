var collate = require('../'),
    assert = require('assert'),
    path = require('path'),
    rigger = require('./mocks/rigger'),
    fs = require('fs'),
    _templateComparison;

describe('it should collate separate files into a single JS statement', function() {
    before(function(done) {
        fs.readFile(path.resolve(__dirname, '_collated/_templates.js'), 'utf8', function(err, data) {
            _templateComparison = data;
            done(err);
        });
    });
    
    it('can collate files', function(done) {
        var scope = {
            done: function(err, output) {
                console.log(output);
                assert.equal(output, _templateComparison);
                done();
            }
        };
        
        collate.call(scope, rigger, '_templates');
    });
});