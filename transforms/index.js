var hyperstream = require('hstream')
var { Readable } = require('stream')
var through = require('through2')

module.exports = {
  lang,
  meta,
  collect,
  includeScript,
  includeStyle,
  prependToHead,
  appendToHead,
  prependToBody,
  appendToBody
}

function lang () {
  return function (lang) {
    return hyperstream({ html: { lang: lang } })
  }
}

function meta () {
  return function (metaObject) {
    var keys = Object.keys(metaObject)
    var tags = []
    if (keys.length) {
      tags = keys.map(function (key) {
        var type = key.indexOf('og:') !== -1 ? 'property' : 'name'
        var value = metaObject[key]
        if (typeof value === 'string') value = value.replace(/"/g, '&quot;')
        return `<meta ${type}="${key}" content="${value}">`
      })
    }
    return appendToHead()(tags.join('\n'))
  }
}

function collect (ctx) {
  return function (callback) {
    var html = ''

    return through(collect, compose)

    // collect html but push nothing
    function collect (chunk, enc, cb) {
      html += chunk
      cb(null)
    }

    // call the callback with complete HTML
    function compose (cb) {
      callback(ctx, html)
      cb(null, html)
      cb()
    }
  }
}

function includeScript () {
  return function (path) {
    return hyperstream({ body: { _appendHtml: `<script src="${path}" defer></script>` } })
  }
}

function includeStyle () {
  return function (path) {
    return hyperstream({ head: { _appendHtml: `<link rel="stylesheet" href="${path}">` } })
  }
}

function prependToHead () {
  return function (str) {
    return hyperstream({ head: { _prependHtml: str } })
  }
}
function appendToHead () {
  return function (str) {
    return hyperstream({ head: { _appendHtml: str } })
  }
}

function prependToBody () {
  return function (str) {
    return hyperstream({ body: { _prependHtml: str } })
  }
}
function appendToBody () {
  return function (str) {
    return hyperstream({ body: { _appendHtml: str } })
  }
}
