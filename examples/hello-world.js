// register to all of the high-level API functions

var tessel = require('tessel');
var port = tessel.port['A'];
var remote = require('../')(port);

["menu", "center", "up", "down", "right", "left", "play"].forEach(function(b) {
    remote.on(b, function() {
        console.log(b, "pressed")
    })
    remote.on(b + ".long", function() {
        console.log(b + ".long", "pressed")
    })
});
