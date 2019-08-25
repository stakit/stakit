var assert = require('assert')

module.exports = {
  files,
  html,
  state,
  transform
}

// Registers files that need to be copied
function files (_ctx, f) {
  if (Array.isArray(f)) {
    _ctx._files = _ctx._files.concat(f)
  } else if (typeof f === 'object') {
    _ctx._files.push(f)
  } else {
    throw new Error('stakit.files: f must be an array or an object')
  }
}

// Sets custom template html and selector
function html (_ctx, html, selector) {
  assert(typeof html === 'string', 'stakit.html: html must be a string')
  assert(typeof select === 'string', 'stakit.html: selector must be a string')

  _ctx._html = html
  _ctx._selector = selector
}

// Assigns extendState to _ctx.state
function state (_ctx, extendState) {
  assert(typeof extendState === 'object', 'stakit.state: extendState must be an object')
  Object.assign(_ctx.state, extendState)
}

// Pushes a transform to the documentify transform list
function transform (_ctx, fn, opts) {
  assert(typeof fn === 'function', 'stakit.transform: fn must be a function')
  _ctx._transforms.push({
    fn: fn,
    opts: opts
  })
}
