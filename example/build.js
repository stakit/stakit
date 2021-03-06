var stakit = require('..')
var { lang, collect } = require('../transforms')

var content = {
  '/': { title: 'index' },
  '/about': { title: 'about' }
}

var kit = stakit()
  .use(stakit.state({ content: content }))
  .use(stakit.copy({
    [`${__dirname}/test.txt`]: 'asd/test.txt'
  }))
  .routes(function (state) {
    return Object.keys(state.content)
  })
  .render(function (route, state) {
    return {
      html: `<body>${state.content[route].title}</body>`,
      state: { title: state.content[route].title }
    }
  })
  .transform(lang, 'en')
  .transform(collect, function (ctx, html) {
    console.log(ctx.route)
    console.log(html)
  })

kit.output(stakit.writeFiles('./public'))
