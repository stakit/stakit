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
var { render, hydrate } = require('@stakit/choo')

var app = require('.')

var kit = stakit()
  .routes(function (state) {
    return [ '/' ]
  })
  .render(render(app))
  .transform(hydrate)

kit.output(stakit.writeFiles('./public'))
```

## Why?
Generally, you do 2 things when generating a static site:

- fill your **app** with some **content**
- copy static **files**

There are many modular and lovely tools for bundling Javascript or transforming CSS, Stakit doesn't and will not try to be another one, or even try to be compatible with them.

Stakit only handles `.html`, and does that right. You'll have to handle bundling your app and including the bundle if that's what you need. Following [Choo](https://github.com/choojs/choo#philosophy)'s philosophy, it's small, understandable and easy to use. It was designed to work with Choo in the first place, but it should work with other isomorphic frameworks too, without any problems.

## Usage
Stakit is called programitically, not from the command-line, therefore you'll need a Javascript file (like `build.js`), where you require it. Afterwards you can initialize the kit with `stakit()` and then chain a couple of methods.

Two methods must appear in the chain:
- `routes(fn)`
- `render(fn)`

All other methods are optional and called in the following order:

1. `state` calls
2. middlewares applied by `use`
3. the single `routes` function
4. for every route:
    1. a single `render`
    2. all `transform` calls
    3. all `plugin` calls

End the chain with `kit.output()` to write out the files to the disk.

## API
This section provides documentation on how each function in Stakit works. It's intended to be a technical reference.

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

### `kit.use(fn(context))`
Pushes a middleware / plugin to the middlewares list, general purpose functions ran before the route generation. You can modify the context any way you want, from altering the `state` to installing `transform`s.

```javascript
kit.use(function (ctx) {
  ctx._transforms.push(transform)
})
```

### `kit.routes(routeReducer(state))`
The `routeReducer` is a function that gets `context.state` as a parameter and returns an `Array` of strings / routes. These are the routes that stakit will call render on.

```javascript
kit.routes(function (state) {
  return Object.keys(state.content)
  // or statically
  return [ '/', '/about', '/blog' ]
})
```

### `kit.render(renderer(route, state))`
Sets the renderer of the build. This is where the magic happens. The `renderer` will be called for every route returned by `routes`, with the shared state value.

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

### `kit.callback(fn(context, route, html))`
Pushes a callback to the list of callbacks. They're called with the HTML string, after all the transforms had been applied.

See [Callbacks](#callbacks) for more information.

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
Starts the build chain and ends it with passing all the routes to `writerObject.write(route, html)` and all the files that need to be copied to `writerObject.copy(from, to)`. Returns a `Promise` that waits for both writing out and copying the files.

The default "writer", outputs the site to the ``./public`` directory.

See [Writers](#writers) for more information.

## Transforms
Stakit uses [`documentify`](https://github.com/stackhtml/documentify) to build up the HTML. This is very powerful and can easily be modulized. The general format of a stakit transform is:

```javascript
function lang (context) {
  // return the transform
  return function (lang) {
    // return a documentify transform using hstream
    return hstream({ html: { lang: lang } })
  }
}
```

Note: [`hstream`](https://github.com/stackhtml/hstream) is a very good friend!

The `documentify` transform is nested in a function, so we can get the `context` when we need it and still doesn't complicate `documentify`'s API.

Stakit includes the following built-in transforms that you can get by `var transforms = require('stakit/transforms  ')`:
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

## Callbacks
A callback is a simple, general purpose function, called once for every route, after the HTML has been transformed to a string. Built-in its functionality is to modify the HTML, but you can do anything you want from logging to replacing the HTML with an empty string (you know, just in case).

```javascript
stakit()
  .callback(function (context, route, html) {
    // a plugin that changes the html returns the new string
    if (route === '/welcome') {
      return html.replace(/hello/g, 'hi')
    }
  })
  .callback(function (context, route, html) {
    // without changing the html
    console.log(`${route} was built.`)
  })
```

## Writers
Writers handle the outputting of the final static files. This can be the simple outputting to the file-system, but it can get more complex too, like keeping the files in memory and serving from there, or putting them into a [Dat](https://github.com/datproject/dat) archive.

As mentioned earlier they must implement 2 methods:
- `write(route, html)` - save a specific `route` with the content `html`
- `copy(from, to)` - copy a file / directory from the `from` path to the `output/<to>` path.

It's recommended to clean up the directory before every build.

Have a look at the built-in [`stakit.writeFiles`](https://github.com/stakit/stakit/blob/master/lib/file-writer.js) method as an example.

That's all about writers.

## See Also
- [jalla](https://github.com/jalljs/jalla) - Lightning fast web compiler and server in one (also thanks for some code snippets!)
- [documentify](https://github.com/stackhtml/documentify) - Modular HTML bundler

## TODO

- tests
- script, css transform
- repo for other libraries (hstream, nanocontent for example)
