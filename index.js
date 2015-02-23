
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
    return (binary.length != 32);
}

module.exports = {
    durations_from_hex_buffer : durations_from_hex_buffer,
    valid_leader : valid_leader,
    binary_from_durations: binary_from_durations,
    valid_binary : valid_binary,
}
