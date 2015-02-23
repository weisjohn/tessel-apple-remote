
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

// verify the leader bit 
function verify_leader(durations) {
    var on = durations[0];
    var off = durations[1];
    return !(on < 8900 || on > 9150 || off < -4600 || off > -4500);
}

var captures = require('./captures');

captures.forEach(function(capture) {
    capture.hex.forEach(function(str) {
        // turn the sample string capture back into an array of hex bytes
        hex = str.match(/.{2}/g);
        var durations = durations_from_hex_buffer(hex);
        if (!verify_leader(durations)) {
            console.log('miss', durations.join())
        }
    });
});

setInterval(function() {}, 1e3);