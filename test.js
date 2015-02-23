var assert = require('assert');
var captures = require('./captures');
var apple = require('./');

function validate_components(button, str) {
    // turn the sample string capture back into an array of hex bytes
    hex = str.match(/.{2}/g);
    var durations = apple.durations_from_hex_buffer(hex);
    assert(apple.valid_leader(durations), 'invalid lead: ' + durations.join());

    var binary = apple.binary_from_durations(durations);
    assert(apple.valid_binary(durations), 'invalid binary: ' + binary.join());

    var bytes = apple.bytes_from_binary(binary);
    assert(apple.valid_bytes(bytes), 'invalid bytes: ' + bytes.join(' '));
    assert(apple.valid_codes(bytes), 'invalid codes: ' + bytes.join(' '));

    var but = apple.button_from_bytes(bytes);
    assert(but == button, 'invalid button: ' + bytes[2] + ' should be ' + button);
}

function validate_buffer(button, str) {
    var buf = new Buffer(str, 'hex');
    var but = apple.button_from_buffer(buf);
    assert(but == button, 'invalid button: ' + but + ' should be ' + button);
}

captures.forEach(function(capture) {
    capture.hex.forEach(function(str) {
        validate_components(capture.button, str);
        validate_buffer(capture.button, str);
    });
});

setInterval(function(){}, 1e3);