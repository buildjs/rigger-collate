var collate = require('../'),
    assert = require('assert'),
    path = require('path'),
    fs = require('fs'),
    _templateComparison;

describe('it should collate separate files into a single JS statement', function() {
    before(function(done) {
        fs.readFile(path.resolve(__dirname, '_templates.txt'), 'utf8', function(err, data) {
            _templateComparison = data;
            done(err);
        });
    });
    
    it('can collate files', function(done) {
        collate(path.resolve(__dirname, '_templates'), function(err, output) {
            assert.equal(output, _templateComparison);
            done();
        });
    });
});