
// This allows you to control your LEDs with your volume buttons

var tessel = require('tessel');
var port = tessel.port['A'];
var remote = require('../')(port);

var index = 0;
var max = 4;

function render() {
    for (var i = 0; i < max; i++) {
        tessel.led[i].output(i < index ? 1 : 0);
    }
}

function handler(vector) {
    return function() {
        index += vector;
        if (index < 0) index = 0;
        if (index > max) index = max;
        render();
    }
}

remote.on('up', handler(1));
remote.on('down', handler(-1));
render();