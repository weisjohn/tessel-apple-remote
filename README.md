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

 - `menu`
 - `center`
 - `up`
 - `down`
 - `right`
 - `left`

