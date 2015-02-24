
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

    var command_id = apple.command_id_from_bytes(bytes);
    assert(command_id.command == button, 'invalid button: ' + bytes[2] + ' should be ' + button);
}

function validate_buffer(button, str) {
    var buf = new Buffer(str, 'hex');
    var command_id = apple.command_id_from_buffer(buf);
    assert(command_id.command == button, 'invalid button: ' + command_id.command + ' should be ' + button);
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

    capture.second.forEach(function(str) {
        validate_components(capture.button, str);
        validate_buffer(capture.button, str);
    });
});

continues.forEach(function(cont) {
    validate_continue(cont);
});
