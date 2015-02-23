var captures = require('./captures');

// turn the sample string capture back into an array of hex bytes
var str = captures[0].hex[1];
str = str.match(/.{2}/g);

// parse a Buffer|Array of hex values into signed int durations
var complement = false;
for (var i = 0; i < 20; i += 2) {
    var one = str[i];
    var two = str[i + 1];

    var number = parseInt("" + one + two, 16);

    // https://github.com/tessel/ir-attx4 sends off values through a two's complement system
    if (complement) { number = (0xffff - number) + 1; }
    complement = !complement;
}
