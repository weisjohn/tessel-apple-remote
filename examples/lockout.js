
// This allows the first remote to emit a signal to lock out any other involvement.

// To test this, you can either use two remotes, or you can first press a button, 
// then see the event registers, then change your remote's ID via pressing and 
// holding the menu + center buttons for about 10 seconds. After changing your ID
// you will not see any event handlers fire for the old ID.

var tessel = require('tessel');
var port = tessel.port['A'];
var remote = require('../')(port);

// lock down example
var first = true;
remote.on('id', function(id) {
    console.log('id discovered', id);
    if (!first) return;
    first = false;
    ["menu", "center", "up", "down", "right", "left", "play"].forEach(function(cmd) {
        var prefixed = id + "." + cmd;
        remote.on(prefixed, function() {
            console.log(prefixed, "pressed")
        })
        remote.on(prefixed + ".long", function() {
            console.log(prefixed + ".long", "pressed")
        })
    });
});