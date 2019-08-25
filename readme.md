# stakit
A modular toolkit for building static websites.

**Currently in early WIP / planning state.**

<a href="https://nodejs.org/api/documentation.html#documentation_stability_index">
  <img src="https://img.shields.io/badge/stability-experimental-orange.svg?style=flat-square" alt="Stability"/>
</a>
<a href="https://www.npmjs.com/package/stakit">
  <img src="https://img.shields.io/npm/v/stakit.svg?style=flat-square" alt="NPM version"/>
</a>

## Installation
```
npm i stakit
```

## Example
```javascript
var stakit = require('stakit')
var { appendToHead } = require('stakit/transforms')
var renderChoo = require('@stakit/choo')
var stateToHead = require('@stakit/choo/transforms')

var app = require('.')

var kit = stakit()
  // page generation
  .pages(function (state) {
    return [ '/' ]
  })
  // render
  .render(renderChoo(app))
  .transform(stateToHead)

kit.output(stakit.writeFiles('./public'))
```

## Why?
Generally, you do 2 things when generating a static site:

- fill your **app** with some **content**
- copy static **files**

There are many modular and lovely tools for bundling Javascript or transforming CSS, stakit doesn't and will not try to be another one.

Stakit only handles HTML, and does that right. You'll have to handle bundling your app and including the bundle if that's what you need. Following [Choo](https://github.com/choojs/choo#philosophy)'s philosophy, it's small, easy to use and understandable. It was designed with Choo in mind, but it should work with other isomorphic frameworks too.

## Usage
Stakit is called programitically, not from the command-line, therefore you'll need a Javascript file (like `build.js`), where you require it. Afterwards you can initialize the kit with `stakit()` and the chain a couple of methods.

Two methods must appear in the chain:
- `pages(fn)`
- `render(fn)`

All other methods are optional and called in the following order:
```
state() -> pages() -> render() -> transform() -> plugin()
```

End the chain with `kit.output()` to write out the files to the disk.

## API
This section provides documentation on how each function in Choo works. It's intended to be a technical reference.

### `kit = stakit()`
Initialize a new `kit` instance.

### `kit.html(template, selector)`
Sets the starting HTML template and selector.

### `kit.state(extendState)`
Assigns the `extendState` object to `ctx.state`, which is passed to the renderer. You should store everything in the state that's needed by your app.

```javascript
kit.state({
  content: {
    '/': { title: 'home' }
  }
})
```

### `kit.pages(pageReducer(state))`
The `pageReducer` is a function that gets `context.state` as a parameter and returns an `Array` of strings / routes. These are the routes that stakit will call render on.

```javascript
kit.pages(function (state) {
  return Object.keys(state.content)
  // or statically
  return [ '/', '/about', '/blog' ]
})
```

### `kit.render(renderer(route, state))`
Sets the renderer of the build. This is where the magic happens. The `renderer` will be called for every route returned by `pages`, with the shared state value.

It has to return an object with the following:
```javascript
{
  html: string, // the result of the render
  state: object // the state after the render (optional)
}
```

Transforms and plugins will get the updated state.

### `kit.transform(transformFn, opts)`
Pushes a [`documentify`](https://github.com/stackhtml/documentify) transform to the list of transforms. They're called after the rendered content has been replaced in the HTML.

See [Transforms](#transforms) for more information.

### `kit.plugin(fn(context, route, html))`
Pushes a plugin to the list of post-processing plugins. They're called with the HTML string, after all the transforms had been applied.

See [Plugins](#plugins) for more information.

### `kit.files(filesArray | filesObject)`
Appends a list of file paths to `context._files`. They want to be copied to the output directory.

It also accepts an object with the following format if you want to move the file to a different path within the output directory:
```
{
  from: to,
  from: to
}
```

### `kit.output(writerObject)`
Starts the build chain and ends it with passing all the routes to `writerObject.write(route, html)` and all the files that need to be copied to `writerObject.copy(from, to)`.

The default "writer", outputs the site to the ``./public`` directory.

See [Writers](#writers) for more information.

## Transforms
Stakit uses [`documentify`](https://github.com/stackhtml/documentify) to build up the HTML. This is very powerful and can easily be modulized. The general format of a stakit transform is this:

```javascript
function lang (context) {
  // return the transform
  return function (lang) {
    // return a documentify transform using hstream
    return hstream({ html: { lang: lang } })
  }
}
```

[`hstream`](https://github.com/stackhtml/hstream) is a very good friend!

The `documentify` transform is nested in a function, so we can get the `context` if we need it.

Stakit includes the following built-in transforms:
- **lang**: `transform(lang, str)` - sets the language property of the `<html>` element to `str`
- **prependToHead**: `transform(prependToHead, str)` - prepends `str` to the `<head>`
- **appendToHead**: `transform(appendToHead, str)` - appends `str` to the `<head>`
- **prependToBody**: `transform(prependToBody, str)` - prepends `str` to the `<body>`
- **appendToBody**: `transform(appendToBody, str)` - appends `str` to the `<body>`
- **meta**: `transform(meta, obj)` - prepends `<meta>` tags to the head

```javascript
var { meta, prependToHead } = require('stakit/transforms')

stakit()
  .transform(prependToHead, `<link rel="stylesheet" src="/style.css">`)
  .transform(meta, {
    'og:title': 'Site'
  })
```

## Plugins
`TODO`

## Writers
`TODO`

## TODO

- api docs
- tests
