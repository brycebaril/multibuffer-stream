var test = require("tape").test

var mbstream = require("../")
var spigot = require("stream-spigot")
var terminus = require("terminus")
var concat = terminus.concat
var tail = terminus.tail
var through2 = require("through2")

// Brutally chunks stream into <= 3 byte buffers
var chunker = through2.ctor(function (chunk, encoding, callback) {
  var len = chunk.length
  for (var i = 0; i < len; i += 3) {
    this.push(chunk.slice(i, i + 3))
  }
  callback()
})

// Concatenates the stream into pairs of adjacent chunks
var smoosher = through2.ctor(function (chunk, encoding, callback) {
  if (this._prev == null)
    this._prev = chunk
  else {
    this.push(Buffer.concat([this._prev, chunk]))
    this._prev = null
  }
  callback()
}, function (callback) {
  if (this._prev)
    this.push(this._prev)
  callback()
})

var ucFirst = through2.ctor(function (chunk, encoding, callback) {
  chunk[0] = chunk[0] - 32
  this.push(chunk)
  return callback()
})

test("chunker", function (t) {
  t.plan(7)
  var input = spigot(["my", "dear", "aunt", "sally"])

  input.pipe(chunker()).pipe(tail(function (chunk) {
    t.ok(chunk.length <= 3)
  }))
})

test("smoosher", function (t) {
  t.plan(2)
  var input = spigot(["my", "dear", "aunt", "sally"])

  input.pipe(smoosher()).pipe(tail(function (chunk) {
    t.ok(chunk.length == 6 || chunk.length == 9)
  }))
})

test("ucFirst", function (t) {
  t.plan(1)
  var input = spigot(["my", "dear", "aunt", "sally"])
  input.pipe(ucFirst()).pipe(concat(function (buffer) {
    t.equals(buffer.toString(), "MyDearAuntSally")
  }))
})

test("through chunker", function (t) {
  spigot(["my", "dear", "aunt", "sally"])
    .pipe(mbstream.packStream())
    .pipe(chunker())
    .pipe(mbstream.unpackStream())
    .pipe(ucFirst())
    .pipe(concat(function (buffer) {
      t.equals(buffer.toString(), "MyDearAuntSally")
      t.end()
    }))
})

test("through smoosher", function (t) {
  spigot(["my", "dear", "aunt", "sally"])
    .pipe(mbstream.packStream())
    .pipe(smoosher())
    .pipe(mbstream.unpackStream())
    //.pipe(through2(function (c, e, cb) { console.log(c); this.push(c); cb() }))
    .pipe(ucFirst())
    .pipe(concat(function (buffer) {
      t.equals(buffer.toString(), "MyDearAuntSally")
      t.end()
    }))
})
