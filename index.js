var multibuffer = require("multibuffer")
var through2map = require("through2-map")
var through2 = require("through2")
var bops = require("bops")

module.exports.packStream = through2map.ctor(multibuffer.encode)
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
    if (this._bufferState != null)
      this._bufferState = bops.join([this._bufferState, chunk])
    else
      this._bufferState = chunk
    _flush.call(this, callback)
  }
  return through2(_transform, _flush)
}