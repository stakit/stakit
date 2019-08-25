var stakit = require('..')
var { appendToBody, appendToHead, lang } = require('../transforms')
var path = require('path')

var content = {
  '/': { title: 'index' },
  '/about': { title: 'about' }
}

var kit = stakit()
  .files([ path.join(__dirname, 'robots.txt') ])
  .state({ content: content })
  .pages(function (state) {
    return Object.keys(state.content)
  })
  .render(function (route, state) {
    return {
      html: `<body>${state.content[route].title}</body>`,
      state: { title: state.content[route].title }
    }
  })
  .transform(lang, 'en')
  .plugin(function (ctx, route, html) {
    return (html + `<!-- ${route} -->`)
  })

kit.output(stakit.writeFiles('./public'))
