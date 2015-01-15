multibuffer-stream
=====

[![NPM](https://nodei.co/npm/multibuffer-stream.svg)](https://nodei.co/npm/multibuffer-stream/)

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

// Convert a stream into a multibuffer stream with `wrap`
// **NOTE** You **MUST** know the full length of the stream first!
var fs = require("fs")
var file = "./README.md"
var size = fs.statSync(file).size
fs.createReadStream(file)
  .pipe(mbstream.wrap(size))     // convert to multibuffer-stream
  .pipe(mbstream.unpackStream()) // convert back to regular stream

```

API
===

`.packStream()`
---

Create a `stream.Transform` instance that will convert buffers written to it into [multibuffers](http://npm.im/multibuffer)

`.unpackStream()`
---

Create a `stream.Transform` instance that will re-assemble the original packed stream.

`.wrap(byteLength)`
---

Creates a `Transform` stream that will wrap a **known length** stream as a multibuffer (i.e. prefix the first chunk with the length).

This means it is not suitable for never-ending streams.

LICENSE
=======

MIT
