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

##### `id`

Each Apple Remote sends along a simple remote ID between 0-255 (0xFF). To differentiate between remotes, you can prefix both the command events and continuation events with that id. For example, if your remote had the ID of 50

```javascript
apple.on('50.menu', function() {
    console.log('my remote clicked "menu"');
});
```

To enable discovery on the fly of remote IDs, an `id` event is emitted, with a value of the new id:

```
apple.on('id', function(id) {
    console.log('a new challenger appears', id);
});
```

To test this, you can either use two remotes, or you can first press a button on the remote, notice the `id` event fires, then change your remote's ID by pressing and holding the menu + center buttons for about 10 seconds. After changing your ID you will not see any event handlers fire for the old ID.

##### `data`

The standard `data` event is unmodified.

```
apple.on('data', function(data) {
    // access to the low-level duration stream
    console.log(data.toString('hex'));
});
```
##### `error`

The standard `error` event is unmodified.

```
apple.on('error', function(error) {
    console.log(error);
});
```


### examples

1. Plug the IR module into Port A on your Tessel, then connect via USB
2. `tessel run [script]` to test scripts in [examples](./examples) folder.
3. Click buttons on your remote and commence mad science.
