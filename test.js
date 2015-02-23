var assert = require('assert');
var captures = require('./captures');
var apple = require('./');

captures.forEach(function(capture) {
    capture.hex.forEach(function(str) {
        // turn the sample string capture back into an array of hex bytes
        hex = str.match(/.{2}/g);
        var durations = apple.durations_from_hex_buffer(hex);
        assert(apple.valid_leader(durations), 'invalid lead', durations.join());

        var binary = apple.binary_from_durations(durations);
        assert(apple.valid_binary(durations), 'invalid binary', binary.join());

        
    });
});

setInterval(function(){}, 1e3);