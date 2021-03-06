var assert = require('assert')

module.exports = {
  html,
  use,
  transform
}

// Sets custom template html and selector
function html (_ctx, html, selector) {
  assert(typeof html === 'string', 'stakit.html: html must be a string')
  assert(typeof select === 'string', 'stakit.html: selector must be a string')

  _ctx._html = html
  _ctx._selector = selector
}

// Pushes a middleware.
function use (_ctx, fn) {
  assert(typeof fn === 'function', 'stakit.use: fn must be a function')
  _ctx._middlewares.push(fn)
}

// Pushes a transform to the documentify transform list
function transform (_ctx, fn, opts) {
  assert(typeof fn === 'function', 'stakit.transform: fn must be a function')
  _ctx._transforms.push({
    fn: fn,
    opts: opts
  })
}
