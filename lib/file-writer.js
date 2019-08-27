var fs = require('fs')
var ncp = promisify(require('ncp'))
var rmrf = promisify(require('rimraf'))
var mkdirp = require('mkdirp').sync
var path = require('path')

module.exports = fileWriter

function fileWriter (outputPath) {
  var promise = reset()

  async function reset () {
    // clean and ensure
    await rmrf(outputPath)
    mkdirp(outputPath)
  }

  async function write (file) {
    await promise

    var dir = path.join(outputPath, path.dirname(file.destination))
    var basename = path.basename(file.destination)
    mkdirp(dir)

    switch (file.type) {
      case 'string':
        fs.writeFileSync(path.join(dir, basename), file.value)
        break;
      case 'stream':
        file.value.pipe(fs.createWriteStream(path.join(dir, basename)))
        break;
    }
  }

  return {
    write
  }
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
