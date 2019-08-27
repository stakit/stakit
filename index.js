var assert = require('assert')
var concat = require('concat-stream')
var path = require('path')
var methods = require('./lib/methods')
var middlewares = require('./lib/middlewares')
var document = require('./lib/document')
var utils = require('./lib/utils')

module.exports = Stakit

var REQUIRED_VALUES = [ 'ucer', '_renderer' ]

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
    _middlewares: [],
    _transforms: [],
    _callbacks: [],
    _html: TEMPLATE,
    _selector: 'body'
  }
  this._routesReducer = null
  this._renderer = null
}

Stakit.prototype.routes = function (reducer) {
  assert(typeof reducer === 'function', 'stakit.routes: reducer must be a function')
  this._routesReducer = reducer
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

  // run through all the middlewares
  this._context._middlewares.forEach(function (fn) {
    fn(self._context)
  })

  // the state is already filled up, get the routes
  var routes = this._routesReducer(this._context.state)

  await Promise.all(
    routes.map(async function (route) {
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

      // callbacks
      self._context._callbacks.forEach(function (callback) {
        var value = callback.fn(context, route, html)
        if (value) {
          html = value
        }
      })

      writer.write(utils.newFile('string', path.join(route, 'index.html'), html))
    })
  )

  this._context._files.forEach(function (file) {
    writer.write(file)
  })
}

// dynamically add public methods
Object.keys(methods).forEach(function (key) {
  Stakit.prototype[key] = function (...args) {
    methods[key](this._context, ...args)
    return this
  }
})

// dynamically add static methods and properties
Object.keys(middlewares).forEach(function (key) {
  Stakit[key] = middlewares[key]
})
