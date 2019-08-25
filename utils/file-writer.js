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

  async function write (route, html) {
    await promise

    var dir = path.join(outputPath, route)
    mkdirp(dir)
    fs.writeFileSync(path.join(dir, 'index.html'), html)
  }

  async function copy (from, to) {
    await promise

    try {
      await ncp(from, path.join(outputPath, path.basename(to)))
    } catch (err) {
      console.error(err)
    }
  }

  return {
    write,
    copy
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
