var assert = require('assert')
var path = require('path')
var methods = require('./lib/methods')
var middlewares = require('./lib/middlewares')
var document = require('./lib/document')
var utils = require('./lib/utils')

module.exports = Stakit

var REQUIRED_VALUES = ['_routesReducer', '_renderer']

var TEMPLATE = `
  <!doctype html>
  <html>
  <head></head>
  <body></body>
  </html>
`

function Stakit () {
  if (!(this instanceof Stakit)) return new Stakit()

  this._context = {
    state: {}, // state forwarded for the render method
    _files: [],
    _middlewares: [],
    _transforms: [],
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
  writer = writer || middlewares.writeFiles(path.join(process.cwd(), 'public'))

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

  // wait until all the pages are written
  await Promise.all(
    routes.map(async function (route) {
      // get rendered view
      var view = self._renderer(route, self._context.state)

      // clone and update the context with the new state
      var context = Object.assign({}, self._context)
      context = Object.assign(context, {
        state: view.state ? Object.assign(self._context.state, view.state) : self._context.state,
        route: route
      })

      // documentify + handle transforms
      var stream = document(view.html, context)

      await writer.write(utils.newFileStream(null, path.join(route, 'index.html'), stream))
    })
  )

  // wait until all the files are written
  await Promise.all(
    this._context._files.map(async function (file) {
      await writer.write(file)
    })
  )
}

// dynamically add public methods
Object.keys(methods).forEach(function (key) {
  Stakit.prototype[key] = function (...args) {
    methods[key](this._context, ...args)
    return this
  }
})

// dynamically add middlewares as static methods
Object.keys(middlewares).forEach(function (key) {
  Stakit[key] = middlewares[key]
})

// export the transforms object
Stakit.transforms = require('./transforms')
