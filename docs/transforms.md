## Built-in Transforms

```javascript
var transform = require('stakit/transforms')
var { lang, meta } = require('stakit/transforms')
```

Stakit includes the following built-in transforms:

### `lang`
`transform(lang, str)`

Sets the language property of the `<html>` element to `str`.

---

### `meta`
`transform(meta, obj)`

Appends `<meta>` tags to the `<head>`.

---

### `collect`
`transform(collect, fn(ctx, html))`

Collects the complete HTML from the stream and passes it to `fn` along with the full context.

---

### `prependToHead`
`transform(prependToHead, str)`

Prepends `str` to the `<head>`.

---

### `appendToHead`
`transform(appendToHead, str)`

Appends `str` to the `<head>`.

---

### `prependToBody`
`transform(prependToBody, str)`

Prepends `str` to the `<body>`.

---

### `appendToBody`
`transform(appendToBody, str)`

Appends `str` to the `<body>`.

## Example

```javascript
var { meta, collect, prependToHead } = require('stakit/transforms')

stakit()
  .transform(prependToHead, `<link rel="stylesheet" src="/style.css">`)
  .transform(meta, {
    'og:title': 'Site'
  })
  .transform(collect, function (ctx, html) {
    console.log(`Built ${ctx.route}:`)
    console.log(html, '\n')
  })
```
