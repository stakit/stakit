var assert = require('assert')
var writeFiles = require('./file-writer')

module.exports = {
  state,
  writeFiles
}

// Middleware to help assigning values to the state
function state (extendState) {
  assert(typeof extendState === 'object', 'stakit.state: extendState must be an object')
  return function (ctx) {
    ctx.state = Object.assign(ctx.state, extendState)
  }
}
