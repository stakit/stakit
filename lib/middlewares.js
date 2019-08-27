var assert = require('assert')
var fs = require('fs')
var path = require('path')
var writeFiles = require('./file-writer')
var utils = require('./utils')

module.exports = {
  copy,
  state,
  writeFiles
}

// Appends the files to the output list as streams.
function copy (files) {
  assert(typeof files === 'object', 'stakit.copy: files must be an array or object')

  return function (ctx) {
    var fromTo = {}

    // resolve from and to pairs
    if (Array.isArray(files)) {
      files.forEach(function (path) {
        fromTo[path] = path
      })
    } else {
      fromTo = files
    }

    Object.keys(fromTo).forEach(function (from) {
      var stream = fs.createReadStream(resolve(from))
      ctx._files.push(utils.newFileStream(fromTo[from], stream))
    })
  }
}

// Middleware to help assigning values to the state
function state (extendState) {
  assert(typeof extendState === 'object', 'stakit.state: extendState must be an object')
  return function (ctx) {
    ctx.state = Object.assign(ctx.state, extendState)
  }
}

function resolve (str) {
  return path.isAbsolute(str) ? str : path.resolve(str)
}
