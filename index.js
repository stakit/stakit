var assert = require('assert')
var concat = require('concat-stream')
var path = require('path')
var methods = require('./lib/methods')
var document = require('./lib/document')
var fileWriter = require('./lib/file-writer')

module.exports = Stakit
module.exports.writeFiles = fileWriter // todo

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
    _plugins: [],
    _html: TEMPLATE,
    _selector: 'body'
  }
  this._pageReducer = null
  this._renderer = null
}

Stakit.prototype.routes = function (reducer) {
  assert(typeof reducer === 'function', 'stakit.routes: reducer must be a function')
  this._pageReducer = reducer
  return this
}

Stakit.prototype.render = function (renderer) {
  assert(typeof renderer === 'function', 'stakit.render: renderer must be a function')
  this._renderer = renderer
  return this
}

Stakit.prototype.output = async function (writer) {
  writer = writer || fileWriter(path.join(process.cwd(), 'public'))

  var self = this
  // check all required values
  REQUIRED_VALUES.forEach(function (key) {
    if (self[key] === null) {
      throw new Error(`stakit.output: ${key} was not set, but it's required`)
    }
  })

  // the state is already filled up, get the routes
  var routes = this._pageReducer(this._context.state)

  await Promise.all(routes.map(async function (route) {
    // get rendered view
    var view = self._renderer(route, self._context.state)

    // clone and update the context with the new state
    var context = Object.assign(self._context, {
      state: view.state ? Object.assign(self._context.state, view.state) : self._context.state
    })

    // documentify + handle transforms
    var html = await new Promise(function (resolve) {
      var stream = document(view.html, context)
      stream.pipe(concat({ encoding: 'string' }, resolve))
    })

    // plugins (post transformations)
    self._context._plugins.forEach(function (plugin) {
      var value = plugin.fn(context, route, html)
      if (value) {
        html = value
      }
    })

    writer.write(route, html)
  }))

  // pass files to writer
  if (writer.copy) {
    await Promise.all(this._context._files.map(function (path) {
      if (typeof path === 'object') {
        Object.keys(path).forEach(function (from) {
          writer.copy(from, path[from])
        })
      } else {
        // from === to
        writer.copy(path, path)
      }
    }))
  }
}

// dynamically add helper methods
Object.keys(methods).forEach(function (key) {
  Stakit.prototype[key] = function (...args) {
    methods[key](this._context, ...args)
    return this
  }
})
