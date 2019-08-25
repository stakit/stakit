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

- fill you **app** with some **content**
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

## TODO

- api docs
- tests
