var infrared = require('ir-attx4');

// understanding the implementation:
// https://github.com/tessel/ir-attx4#api-infrared-on-data-callback-data-Emitted-when-an-infrared-signal-is-detected
// http://techdocs.altium.com/display/FPGA/NEC+Infrared+Transmission+Protocol
// http://en.wikipedia.org/wiki/Apple_Remote#Technical_details
// https://github.com/squeed/AppleRemoteSender/blob/master/AppleRemoteSender.cpp
// https://hifiduino.wordpress.com/apple-aluminum-remote/ 


// parse a Buffer|Array of 16 bit words into signed int durations
// command variant, 134 16bit dwords becomes 67[]int
var command_durations = new Array(67);
function command_durations_from_hex_buffer(buf) {
    // https://github.com/tessel/ir-attx4 sends off values through a two's complement system
    for (var i = 0; i < 134; i += 2) {
        command_durations[i / 2] = buf.readInt16BE(i);
    }
    return command_durations;
}


// parse a Buffer|Array of 16 bit words into signed int durations
// continue variant, 6 16bit dwords becomes 3[]int
var continue_durations = new Array(3);
function continue_durations_from_hex_buffer(buf) {
    // https://github.com/tessel/ir-attx4 sends off values through a two's complement system
    for (var i = 0; i < 6; i += 2) {
        continue_durations[i / 2] = buf.readInt16BE(i);
    }
    return continue_durations;
}

// validate the leader bit 
function valid_leader(durations) {
    var on = durations[0];
    var off = durations[1];
    return (8900 < on && on < 9200) && (-4600 < off && off < -4350);
}

// only used to process commands
var binary = new Array(32);
function binary_from_durations(durations) {
    // skip the leader, ignore the stop bit
    var len = durations.length - 1, on, off;
    for (var i = 2; i < len; i += 2) {
        on = durations[i];
        off = durations[i + 1];
        if (on >= 500 && on < 700) {
            if (off <= -500 && off >= -650) {
                // basically a fast .push()
                binary[i / 2 - 1] = 0;
            } else if (off < -1600 && off >= -1750) {
                binary[i / 2 - 1] = 1;
            }
        }
    }

    return binary;
}

function valid_binary(binary) {
    return binary.length == 32;
}

var bytes = new Array(4);
function bytes_from_binary(binary) {

    // parse backwards, the least significant bit comes first
    var len = binary.length, byte;
    for (var i = len; i > 0; i -= 8) {
        byte = "";
        for (var j = 0; j < 7; j++) {
            byte += binary[i - j - 1];
        }
        bytes[(i / 8) - 1] = parseInt(byte, 2);
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

    var durations = command_durations_from_hex_buffer(data);

    if (!valid_leader(durations)) return;

    var binary = binary_from_durations(durations);
    if (!valid_binary(binary)) return;

    var bytes = bytes_from_binary(binary);
    if (!valid_bytes(bytes)) return;
    if (!valid_codes(bytes)) return;

    return command_id_from_bytes(bytes);
}


// determine whether or not the buffer is a valid continuation code
function continue_from_buffer(data) {

    var durations = continue_durations_from_hex_buffer(data);

    var on = durations[0];
    var off = durations[1];
    var stop = durations[2];

    return (8900 < on && on < 9200) &&
        (-2350 < off && off < -2100) &&
        (500 < stop && stop < 650);
}

module.exports = function(port) {

    var ir = infrared.use(port);

    // on each data packet received, process the whole flow
    var button, ids = {}, id, listeners = {};

    // selectively emit, only if someone is listening
    function proxy_emit(event, data) {
        if (listeners[event]) ir.emit(event, data);
    }

    ir.on('newListener', function(event) {
        listeners[event] = true;
    });

    ir.on('removeListener', function(event) {
        listeners[event] = false;
    });

    ir.on('data', function(data) {

        var start = Date.now();

        // don't do any processing if we're just getting interference
        if (data.length < 6) return;

        // continues are short, buttons long
        if (data.length == 6) {
            // we can't send a continue if we miss the first button press
            if (button && continue_from_buffer(data)) {
                proxy_emit(button + ".long");
                proxy_emit(id + "." + button + ".long");
            }
        } else if (data.length == 134) {
            command_id = command_id_from_buffer(data);
            if (command_id) {
                button = command_id.command;
                if (id != command_id.id) {
                    id = command_id.id;
                    if (!ids[id]) proxy_emit('id', id);
                    ids[id] = true;
                }
                proxy_emit(button);
                proxy_emit(id + "." + button);
            } 
        }

        console.log("duration:", Date.now() - start);

    });

    return ir;
}

// expose additional functionality to allow for easy testing
module.exports.command_durations_from_hex_buffer = command_durations_from_hex_buffer;
module.exports.continue_durations_from_hex_buffer = continue_durations_from_hex_buffer;
module.exports.valid_leader = valid_leader;
module.exports.binary_from_durations = binary_from_durations;
module.exports.valid_binary = valid_binary;
module.exports.bytes_from_binary = bytes_from_binary;
module.exports.valid_bytes = valid_bytes;
module.exports.command_id_from_bytes = command_id_from_bytes;
module.exports.command_id_from_buffer = command_id_from_buffer;
module.exports.continue_from_buffer = continue_from_buffer;