var infrared = require('ir-attx4');

// understanding the implementation:
// https://github.com/tessel/ir-attx4#api-infrared-on-data-callback-data-Emitted-when-an-infrared-signal-is-detected
// http://techdocs.altium.com/display/FPGA/NEC+Infrared+Transmission+Protocol
// http://en.wikipedia.org/wiki/Apple_Remote#Technical_details
// https://github.com/squeed/AppleRemoteSender/blob/master/AppleRemoteSender.cpp
// https://hifiduino.wordpress.com/apple-aluminum-remote/ 

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

// validate the leader bit 
function valid_leader(durations) {
    var on = durations[0];
    var off = durations[1];
    return !(on < 8900 || on > 9150 || off < -4600 || off > -4400);
}

function binary_from_durations(durations) {
    var binary = [];
    // skip the leader, ignore the stop bit
    for (var i = 2; i < durations.length - 1; i += 2) {
        var on = durations[i];
        var off = durations[i + 1];
        if (on >= 500 && on < 700) {
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

    // parse backwards, the least significant bit comes first
    for (var i = binary.length; i > 0; i -= 8) {
        var byte = 0;
        for (var j = 0; j < 7; j++) {
            byte += "" + binary[i - j - 1];
        }
        bytes.unshift(parseInt(byte, 2));
    }
    return bytes;
}

function valid_bytes(bytes) {
    return bytes.length == 4;
}

// validate the Apple-specific ID
function valid_codes(bytes) {
    return bytes[0] == 0x77 && bytes[1] == 0x43;
}


// using the byte array, return a string name
var commands = {
    1: "menu",
    2: "center",
    3: "right",
    4: "left",
    5: "up",
    6: "down",
    46: "center",
    47: "play"
}

// switch between first and second generation maps
function command_id_from_bytes(bytes) {
    if (!commands[bytes[2]]) return;
    return { command : commands[bytes[2]], id : bytes[3] };
}

// a small implementation of the whole flow
function command_id_from_buffer(data) {

    var chopped = data.toString('hex').match(/.{2}/g);
    var durations = durations_from_hex_buffer(chopped);

    if (!valid_leader(durations)) return;

    var binary = binary_from_durations(durations);
    if (!valid_binary(durations)) return;

    var bytes = bytes_from_binary(binary);
    if (!valid_bytes(bytes)) return;
    if (!valid_codes(bytes)) return;

    return command_id_from_bytes(bytes);
}


// determine whether or not the buffer is a valid continuation code
function continue_from_buffer(data) {
    var chopped = data.toString('hex').match(/.{2}/g);
    var durations = durations_from_hex_buffer(chopped);

    var on = durations[0];
    var off = durations[1];
    var stop = durations[2];

    return (on > 8900 && on < 9150) &&
        (off > -2350 && off < -2100) &&
        (stop > 500 && stop < 650);
}

module.exports = function(port) {

    var ir = infrared.use(port);

    // on each data packet received, process the whole flow
    var button, ids = {}, id;
    ir.on('data', function(data) {

        // don't do any processing if we're just getting interference
        if (data.length < 6) return;

        // continues are short, buttons long
        if (data.length == 6) {
            // we can't send a continue if we miss the first button press
            if (button && continue_from_buffer(data)) {
                ir.emit(button + ".long");
                ir.emit(id + "." + button + ".long");
            }
        } else if (data.length == 134) {
            command_id = command_id_from_buffer(data);
            if (command_id) {
                button = command_id.command;
                if (id != command_id.id) {
                    id = command_id.id;
                    if (!ids[id]) ir.emit('id', id);
                    ids[id] = true;
                }
                ir.emit(button);
                ir.emit(command_id.id + "." + button);
            } 
        }
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
module.exports.command_id_from_bytes = command_id_from_bytes;
module.exports.command_id_from_buffer = command_id_from_buffer;
module.exports.continue_from_buffer = continue_from_buffer;