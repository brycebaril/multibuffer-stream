multibuffer-stream
=====

[![NPM](https://nodei.co/npm/multibuffer-stream.png)](https://nodei.co/npm/multibuffer-stream/)

[![david-dm](https://david-dm.org/brycebaril/multibuffer-stream.png)](https://david-dm.org/brycebaril/multibuffer-stream/)
[![david-dm](https://david-dm.org/brycebaril/multibuffer-stream/dev-status.png)](https://david-dm.org/brycebaril/multibuffer-stream#info=devDependencies/)

A streaming version of [multibuffer](http://npm.im/multibuffer)

This is useful for packaging your buffers to cross transport layers that may alter the stream frame boundaries (e.g. combine chunks or break in the middle of them) so they can be re-assembled into the original buffers.

```javascript
var mbstream = require("multibuffer-stream")
var through2 = require("through2")
var spigot = require("stream-spigot")

spigot(["my", "dear", "aunt", "sally"])
  .pipe(mbstream.packStream()) // encode
  .pipe(through2(function (chunk, encoding, callback) {
    // Brutally chunk the stream into <= 3 byte chunks
    var len = chunk.length
    for (var i = 0; i < len; i += 3) {
      this.push(chunk.slice(i, i + 3))
    }
    callback()
  }))
  .pipe(mbstream.unpackStream()) // re-assemble into original buffers
  .pipe(through2(function (chunk, encoding, callback) {
    chunk[0] = chunk[0] - 32 // upper-case first character
    this.push(chunk)
    return callback()
  }))
  .pipe(process.stdout)

/*
MyDearAuntSally
 */
```

API
===

`.packStream()`
---

Create a `stream.Transform` instance that will convert buffers written to it into [multibuffers](http://npm.im/multibuffer)

`.unpackStream()`
---

Create a `stream.Transform` instance that will re-assemble the original packed stream.

LICENSE
=======

MIT
