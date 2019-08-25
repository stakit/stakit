var stakit = require('..')
var { appendToBody, appendToHead, lang } = require('../utils/transforms')

var content = {
  '/': { title: 'index' },
  '/about': { title: 'about' }
}

var kit = stakit()
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

kit.output()
