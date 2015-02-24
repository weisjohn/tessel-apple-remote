
var assert = require('assert');
var apple = require('./');
var buttons = require('./buttons');
var continues = require('./continues');

function validate_components(button, str) {
    // turn the sample string capture back into an array of hex bytes
    hex = str.match(/.{2}/g);
    var durations = apple.durations_from_hex_buffer(hex);
    assert(apple.valid_leader(durations), 'invalid lead: ' + durations.join());

    var binary = apple.binary_from_durations(durations);
    assert(apple.valid_binary(durations), 'invalid binary: ' + binary.join());

    var bytes = apple.bytes_from_binary(binary);
    assert(apple.valid_bytes(bytes), 'invalid bytes: ' + bytes.join(' '));

    var but = apple.button_from_bytes(bytes);
    assert(but == button, 'invalid button: ' + bytes[2] + ' should be ' + button);
}

function validate_buffer(button, str) {
    var buf = new Buffer(str, 'hex');
    var but = apple.button_from_buffer(buf);
    assert(but == button, 'invalid button: ' + but + ' should be ' + button);
}

function validate_continue(str) {
    var buf = new Buffer(str, 'hex');
    var cont = apple.continue_from_buffer(buf);
    assert(cont, 'invalid continue: should be true');
}

buttons.forEach(function(capture) {
    capture.first.forEach(function(str) {
        validate_components(capture.button, str);
        validate_buffer(capture.button, str);
    });

    // console.log(capture.button)
    // capture.second.forEach(function(str) {
    //     validate_components(capture.button, str);
    //     // validate_buffer(capture.button, str);
    // });
});

continues.forEach(function(cont) {
    validate_continue(cont);
});

setInterval(function() {}, 1e3);