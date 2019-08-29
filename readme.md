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

There are many modular (and lovely) tools for bundling Javascript or transforming CSS, Stakit is something similar, but for the full site,
and especially focuses on HTML files.

You'll have to handle the bundling of your app and including the bundle if that's what you need. Following [Choo](https://github.com/choojs/choo#philosophy)'s philosophy, it's small, understandable and easy to use. It was designed to work mainly with Choo, but it should work with other isomorphic frameworks too.

## Usage
Stakit is called programmatically, not from the command-line, therefore you'll need a Javascript file (like `build.js`), where you require it. Afterwards you can initialize the kit with `stakit()` and then chain a couple of methods.

Two methods must appear in the chain:
- [`routes(fn)`](#kitroutesroutereducerstate)
- [`render(fn)`](#kitrenderrendererroute-state)

All other methods are optional and called in the following order:

1. all the middlewares applied by `kit.use()`
2. the applied [`routesReducer`](#kitroutesroutereducerstate) function
3. for every route:
    1. a single call to the applied [`renderer`](#kitrenderrendererroute-state)
    2. all `transform` calls

End the chain with `kit.output()`.

## API
This section provides documentation on how each function in Stakit works. It's intended to be a technical reference.

### `kit = stakit()`
Initialize a new `kit` instance.

### `kit.html(template, selector)`
Sets the starting HTML template and selector.

### `kit.use(fn(context))`
Pushes a middleware / plugin to the middlewares list, general purpose functions ran before the route generation. You can modify the context any way you want, from altering the `state` to installing `transform`s.

```javascript
kit.use(function (ctx) {
  ctx._transforms.push(transform)
})
```

See [Middlewares](#middlewares) for more information.

### `kit.routes(routeReducer(state))`
The `routeReducer` is a function that gets `context.state` as a parameter and returns an `Array` of strings / routes. These are the routes on which Stakit will call `render`.

```javascript
kit.routes(function (state) {
  return Object.keys(state.content)
  // or statically
  return [ '/', '/about', '/blog' ]
})
```

### `kit.render(renderer(route, state))`
Sets the renderer of the build. This is where the magic happens. The `renderer` will be called for every route returned by `routes`.

It has to return an object with the following values:

```javascript
{
  html: string, // the result of the render
  state: object // the state after the render (optional)
}
```

Transforms will receive the updated state returned here.

### `kit.transform(transformFn, opts)`
Pushes a transform to the list of transforms. Stakit uses [`documentify`](https://github.com/stackhtml/documentify) and streams to build up the HTML.

They're called after the rendered content has been replaced in the HTML.

See [Transforms](#transforms) for more information.

### `kit.output(writerObject)`
Starts the build chain and ends it with passing all the routes to `writerObject.write({ destination, stream })`. Returns a `Promise` that waits until all files (routes and static) has been completely written.

By default it uses a Writer that outputs the site to the ``./public`` directory.

See [Writers](#writers) for more information.

## Middlewares
Built-in middlewares:

### `stakit.state(extendState)`
Utility to help you with adding values to `context.state`

```javascript
kit.use(stakit.state({ message: 'good morning!' }))
```

### `stakit.copy(files)`
Middleware for copying files to the output directory.

```javascript
// Copy files to the same location
kit.use(stakit.copy([ 'robots.txt' ]))

// Copy files to a different location within the output path
kit.use(stakit.copy({
  'robots.txt': 'robots.txt',
  'sitemap.xml': 'sitemaps/sitemap.xml'
}))
```

## Transforms
[`Documentify`](https://github.com/stackhtml/documentify) is very powerful and can easily be modulized. The general format of a Stakit transform is:

```javascript
// wrapped in a function
function lang (context) {
  // return the documentify transform
  return function (lang) {
    // return a transform stream
    return hstream({ html: { lang: lang } })
  }
}
```

Note: [`hstream`](https://github.com/stackhtml/hstream) is a very good friend!

The `documentify` transform is wrapped in a function, so we can get the `context` when we need it, without messing with `documentify`'s API.

See what transforms come with Stakit in [`docs/transforms.md`](https://github.com/stakit/stakit/blob/master/docs/transforms.md).

## Writers
Writers output the generated, transformed static files. This can vary from outputting to the file-system, to putting them into a [Dat](https://github.com/datproject/dat) archive.

A writer must implement a method: `write`. For every file, including the generated pages + the files added to `context._files`, `writer.write` will be called with a file object. It should return a `Promise` that returns after the pipe was flushed (the file was completely written).

A file object looks like this:

```
{
  source: null | string,
  destination: string,
  stream: Stream
}
```

It's recommended to clean up the output directory before every build.

Have a look at the built-in [`stakit.writeFiles`](https://github.com/stakit/stakit/blob/master/lib/file-writer.js) method as an example.

That's all about writers.

## See Also
- [jalla](https://github.com/jalljs/jalla) - Lightning fast web compiler and server in one (also thanks for a lot of code snippets!)
- [documentify](https://github.com/stackhtml/documentify) - Modular HTML bundler
