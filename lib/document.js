var documentify = require('documentify')
var hyperstream = require('hstream')
var { prependToHead } = require('../transforms')

module.exports = document

function document (renderedHtml, context) {
  var d = documentify(context.html)

  // inject rendered content
  d.transform(function () {
    return hyperstream({
      [context._selector]: { _replaceHtml: renderedHtml }
    })
  })

  // go through all transforms
  context._transforms.forEach(function (t) {
    // pass the context to the transform generator
    d.transform(t.fn(context), t.opts)
  })

  // set the title returned by the renderer
  if (context.state.title) {
    var title = context.state.title.trim().replace(/\n/g, '')
    d.transform(prependToHead(context), `<title>${title}</title>`)
  }

  // useful metas
  d.transform(prependToHead(context), `
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
  `)

  return d.bundle()
}
