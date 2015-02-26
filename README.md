# tessel-apple-remote

An event-emitter interface to an Apple IR Remote using the Tessel IR Module

This module takes the burden off of processing the infared byte buffers and extends the events from [`ir-attx4`](https://github.com/tessel/ir-attx4) to provide a higher-level API for programming against Apple remotes. This module supports both the first and second generation of remotes.

### usage

```javascript
var tessel = require('tessel');
var port = tessel.port['A'];
var apple = require('tessel-apple-remote')(port);

apple.on('menu', function() {
    console.log('menu');
});
```

### events

Simple button presses:

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

To enable discovery on the fly of remote IDs, an `id` event is emitted, with a value of the new id. This event will only be emitted the first time that ID is encountered.

```javascript
apple.on('id', function(id) {
    console.log('a new challenger appears', id);
});
```

To test this, you can either use two remotes, or you can first press a button on the remote, notice the `id` event fires, then change your remote's ID by pressing and holding the menu + center buttons for about 10 seconds. After your remote's ID is changed, another `id` event will be emitted on the next button press. See [examples/lockout.js](examples/lockout.js) for an example of how to isolate your code to the first remote to send an event.

##### `data`

The standard `data` event is unmodified.

```javascript
apple.on('data', function(data) {
    // access to the low-level duration stream
    console.log(data.toString('hex'));
});
```
##### `error`

The standard `error` event is unmodified.

```javascript
apple.on('error', function(error) {
    console.log(error);
});
```


### examples

1. Plug the IR module into Port A on your Tessel, then connect via USB
2. `tessel run [script]` to test scripts in [examples](./examples) folder.
3. Click buttons on your remote and commence mad science.


### notes

Helpful reference material on the implemenation: 

 - [https://github.com/tessel/ir-attx4#api-infrared-on-data-callback-data-Emitted-when-an-infrared-signal-is-detected](https://github.com/tessel/ir-attx4#api-infrared-on-data-callback-data-Emitted-when-an-infrared-signal-is-detected)
 - [http://techdocs.altium.com/display/FPGA/NEC+Infrared+Transmission+Protocol](http://techdocs.altium.com/display/FPGA/NEC+Infrared+Transmission+Protocol)
 - [http://en.wikipedia.org/wiki/Apple_Remote#Technical_details](http://en.wikipedia.org/wiki/Apple_Remote#Technical_details)
 - [https://github.com/squeed/AppleRemoteSender/blob/master/AppleRemoteSender.cpp](https://github.com/squeed/AppleRemoteSender/blob/master/AppleRemoteSender.cpp)
 - [https://hifiduino.wordpress.com/apple-aluminum-remote/](https://hifiduino.wordpress.com/apple-aluminum-remote/)

### hardware

You need:

 - a [Tessel](https://shop.tessel.io/Base%20Boards/Tessel)
 - an [IR module](https://shop.tessel.io/Modules/Infrared%20Module)
 - either a first-generation (white) Apple remote
 - or a [second-generation (silver) Apple remote](http://store.apple.com/us/product/MC377LL/A/apple-remote)

![](http://i.imgur.com/DqH1EMi.jpg)

