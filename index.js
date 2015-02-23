var infrared = require('ir-attx4');

// parse a Buffer|Array of 16 bit words into signed int durations
function durations_from_hex_buffer(buf) {
    // https://github.com/tessel/ir-attx4 sends off values through a two's complement system
    var durations = [];
    var complement = false;
    for (var i = 0; i < buf.length; i += 2) {
        var number = parseInt("" + buf[i] + buf[i + 1], 16);
        if (complement) { number = number - (0xffff + 1); }
        complement = !complement;
        durations.push(number);
    }
    return durations;
}

// http://en.wikipedia.org/wiki/Apple_Remote#Technical_details
// provides all the understanding of the magic values used

// validate the leader bit 
function valid_leader(durations) {
    var on = durations[0];
    var off = durations[1];
    return !(on < 8900 || on > 9150 || off < -4600 || off > -4500);
}

function binary_from_durations(durations) {
    var binary = [];
    // skip the leader, ignore the stop bit
    for (var i = 2; i < durations.length - 1; i += 2) {
        var on = durations[i];
        var off = durations[i + 1];
        if (on >= 550 && on < 700) {
            if (off <= -500 && off >= -650) {
                binary.push(0);
            } else if (off < -1600 && off >= -1750) {
                binary.push(1);
            }
        }
    }
    return binary;
}

function valid_binary(binary) {
    return binary.length != 32;
}

function bytes_from_binary(binary) {
    var bytes = [];

    // http://en.wikipedia.org/wiki/Apple_Remote#Technical_details
    // because the least significant bit comes first, we parse backwards
    for (var i = binary.length; i > 0; i -= 8) {
        var byte = 0;
        for (var j = 0; j < 8; j++) {
            byte += "" + binary[i - j - 1];
        }
        bytes.unshift(parseInt(byte, 2));
    }
    return bytes;
}

function valid_bytes(bytes) {
    return bytes.length == 4;
}

function valid_codes(bytes) {
    return bytes[0] == 0xEE && bytes[1] == 0x87;
}

// using the byte array, return a string name
var command_map = {
    2: "menu",
    // 3: "menu",
    4: "center",
    // 5: "center",
    // 6: "right",
    7: "right",
    8: "left",
    // 9: "left",
    // 10: "up",
    11: "up",
    // 12: "down",
    13: "down"
}


function button_from_bytes(bytes) {
    return command_map[bytes[2]];
}

// a small implementation of the whole flow
function button_from_buffer(data) {

    var chopped = data.toString('hex').match(/.{2}/g);
    var durations = durations_from_hex_buffer(chopped);

    if (!valid_leader(durations)) return;

    var binary = binary_from_durations(durations);
    if (!valid_binary(durations)) return;

    var bytes = bytes_from_binary(binary);
    if (!valid_bytes(bytes)) return;
    if (!valid_codes(bytes)) return;

    return button_from_bytes(bytes);
}

module.exports = function(port) {

    var ir = infrared.use(port);

    // on each data packet received, process the whole flow
    ir.on('data', function(data) {
        var button = button_from_buffer(data);
        if (!button) return;
        ir.emit(button);
    });

    return ir;
}

// expose additional functionality to allow for easy testing
module.exports.durations_from_hex_buffer = durations_from_hex_buffer;
module.exports.valid_leader = valid_leader;
module.exports.binary_from_durations = binary_from_durations;
module.exports.valid_binary = valid_binary;
module.exports.bytes_from_binary = bytes_from_binary;
module.exports.valid_bytes = valid_bytes;
module.exports.valid_codes = valid_codes;
module.exports.button_from_bytes = button_from_bytes;
module.exports.button_from_buffer = button_from_buffer;
