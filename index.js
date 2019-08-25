var assert = require('assert')
var concat = require('concat-stream')
var path = require('path')
var methods = require('./lib/methods')
var document = require('./lib/document')
var fileWriter = require('./utils/file-writer')

module.exports = Stakit

var REQUIRED_VALUES = [ '_pageReducer', '_renderer' ]

var TEMPLATE = `
  <!doctype html>
  <html>
  <head></head>
  <body></body>
  </html>
`

function Stakit () {
  if (!(this instanceof Stakit)) return new Stakit()
  var self = this

  this._context = {
    state: {}, // state forwarded for the render method
    _files: [],
    _transforms: [],
    _html: TEMPLATE,
    _selector: 'body'
  }
  this._pageReducer = null
  this._renderer = null
}

Stakit.prototype.pages = function (reducer) {
  assert(typeof reducer === 'function', 'stakit.pages: reducer must be a function')
  this._pageReducer = reducer
  return this
}

Stakit.prototype.render = function (renderer) {
  assert(typeof renderer === 'function', 'stakit.render: renderer must be a function')
  this._renderer = renderer
  return this
}

Stakit.prototype.output = function (writer) {
  writer = writer || fileWriter(path.join(process.cwd(), 'public'))

  var self = this
  // check all required values
  REQUIRED_VALUES.forEach(function (key) {
    if (self[key] === null) {
      throw new Error(`stakit.output: ${key} was not set, but it's required`)
    }
  })

  // the state is already filled up, get the routes
  var pages = this._pageReducer(this._context.state)

  pages.forEach(async function (route) {
    // get rendered view
    var view = self._renderer(route, self._context.state)

    // clone and update the context with the new state
    var context = Object.assign(self._context, {
      state: Object.assign(self._context.state, view.state)
    })

    // documentify + handle transforms
    var html = await new Promise(function (resolve) {
      var stream = document(view.html, context)
      stream.pipe(concat({ encoding: 'string' }, resolve))
    })

    writer.write(route, html)
  })

  // pass files to writer
  if (writer.copy) {
    this._context._files.forEach(function (path) {
      if (typeof path === 'object') {
        Object.keys(path).forEach(function (from) {
          writer.copy(from, path[from])
        })
      } else {
        // from === to
        writer.copy(path, path)
      }
    })
  }
}

// dynamically add helper methods
Object.keys(methods).forEach(function (key) {
  Stakit.prototype[key] = function (...args) {
    methods[key](this._context, ...args)
    return this
  }
})