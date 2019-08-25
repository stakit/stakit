# stakit
A toolkit for building static websites.

## Ideas
Just sketching out some example here:

```javascript
var stakit = require('stakit')
var { appendToHead, meta } = require('stakit/utils/transforms')
var contentPrismic = require('@stakit/prismic')
var renderChoo = require('@stakit/choo')
var monote = require('monote')

var app = require('.')

var kit = stakit()
  .html('', '') // optional
  // state filling
  .state(contentPrismic(await api.query('')))
  // page generation
  .pages(function (state) {
    return state.prismic.urls()
  })
  // render
  .render(renderChoo(app))
  // transforms
  .transform(appendToHead(`<link rel="stylesheet" href="/bundles/bundle.css">`))
  .transform(meta, { 'og:title': '' })
  // post processing
  .process(function (html) {
    return html.replace(/hello world/g, 'hello guest')
  })
  // copy files
  .files([ 'robots.txt' ])
  .files({
    'style.css': 'assets/style.css'
  })

if (process.argv.indexOf('build') !== -1) {
  // build
  kit.output(stakit.toFiles)
} else {
  // start dev server
  monote(kit, 8080)
}
```

## Structure
- `stakit` - core (not specific to any environment) and utils
-  `@stakit/<env>` - more specific like `@stakit/choo`, `@stakit/prismic`


## TODO

- files
- output builder
- `.textTransform`
