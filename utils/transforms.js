var hyperstream = require('hstream')

module.exports = {
  lang,
  prependToHead,
  appendToHead,
  prependToBody,
  appendToBody,
  meta
}

function lang () {
  return function (lang) {
    return hyperstream({ html: { lang: lang } })
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
    return prependToHead()(tags.join('\n'))
  }
}
