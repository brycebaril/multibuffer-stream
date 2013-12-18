var multibuffer = require("multibuffer")
var through2 = require("through2")

module.exports.packStream = through2.ctor(function (chunk, encoding, callback) {
  this.push(multibuffer.encode(chunk))
  return callback()
})
module.exports.unpackStream = unpackStream

function unpackStream() {
  function _flush(callback) {
    if (this._bufferState == null)
      return callback()

    var partial = multibuffer.readPartial(this._bufferState)
    if (partial[0]) {
      this.push(partial[0])
      this._bufferState = partial[1]
      _flush.call(this, callback)
    }
    else {
      return callback()
    }
  }
  function _transform(chunk, encoding, callback) {
    if (this._bufferState != null) {
      this._bufferState = Buffer.concat([this._bufferState, chunk])
    }
    else
      this._bufferState = chunk
    _flush.call(this, callback)
  }
  return through2(_transform, _flush)
}
