# tessel-apple-ir-remote

An event-emitter interface to an Apple IR Remote using the Tessel IR Module

This module takes the burden off of processing the Infared byte buffers and extends the events from `ir-attx4` to provide a higher-level API for programming against Apple remotes.

### usage

```javascript
var tessel = require('tessel');
var port = tessel.port['A'];
var apple = require('tessel-apple-ir-remote')(port);

apple.on('menu', function() {
    console.log('menu');
});

apple.on('data', function(data) {
    // you still have access to the low-level data stream
});
```

### events

Simple button presses or clicks:

 - `menu`
 - `center`
 - `up`
 - `down`
 - `right`
 - `left`
 - `play`

Each event name has a corresponding `[name].long` event for long presses:

 - `menu.long`
 - `center.long`
 - `up.long`
 - `down.long`
 - `right.long`
 - `left.long`
 - `play.long`

NOTE: both `play` and `play.long` only apply to the 2nd Generation remote.

Low-level buffer data: You can still listen to the `data` event.

### examples

1. Plug the IR module into Port A on your Tessel, then connect via USB
2. `tessel run [script]` to test scripts in [examples](./examples) folder.
3. Click buttons on your remote and commence mad science.