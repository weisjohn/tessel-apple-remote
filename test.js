var assert = require('assert');
var captures = require('./captures');
var apple = require('./');

captures.forEach(function(capture) {
    capture.hex.forEach(function(str) {
        // turn the sample string capture back into an array of hex bytes
        hex = str.match(/.{2}/g);
        var durations = apple.durations_from_hex_buffer(hex);
        assert(apple.valid_leader(durations), 'invalid lead: ' + durations.join());

        var binary = apple.binary_from_durations(durations);
        assert(apple.valid_binary(durations), 'invalid binary: ' + binary.join());

        var bytes = apple.bytes_from_binary(binary);
        assert(apple.valid_bytes(bytes), 'invalid bytes: ' + bytes.join(' '));
        assert(apple.valid_codes(bytes), 'invalid codes: ' + bytes.join(' '));

        var button = apple.button_from_bytes(bytes);
        assert(button == capture.button, 'invalid button: ' + bytes[2] + ' should be ' + capture.button);
    });
});

setInterval(function(){}, 1e3);