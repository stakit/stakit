var fs = require('fs')
var rmrf = promisify(require('rimraf'))
var mkdirp = require('mkdirp').sync
var path = require('path')
var through = require('through2')

module.exports = fileWriter

function fileWriter (outputPath) {
  var promise = reset()

  async function reset () {
    // clean and ensure
    await rmrf(outputPath)
    mkdirp(outputPath)
  }

  function write (file) {
    return new Promise(function (resolve) {
      // wait for the reset
      promise.then(function () {
        var dir = path.join(outputPath, path.dirname(file.destination))
        var basename = path.basename(file.destination)

        // ensure the directory exists
        mkdirp(dir)

        file.stream
          .pipe(through(write, end))
          .pipe(fs.createWriteStream(path.join(dir, basename)))

        // noop
        function write (chunk, enc, cb) {
          cb(null, chunk)
        }

        // callback on flush
        function end (cb) {
          resolve()
          cb()
        }
      }, onError)
    })
  }

  return { write }
}

function onError (err) {
  console.error(err)
}

// (fn) -> fn
function promisify (fn) {
  return function (...args) {
    return new Promise(function (resolve, reject) {
      fn(...args, function (err) {
        if (err) {
          reject(err)
          return
        }
        resolve()
      })
    })
  }
}
