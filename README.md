mithril-node-render
===================
[![Gitter](https://img.shields.io/badge/gitter-join_chat-1dce73.svg?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4NCjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB4PSIwIiB5PSI1IiBmaWxsPSIjZmZmIiB3aWR0aD0iMSIgaGVpZ2h0PSI1Ii8%2BPHJlY3QgeD0iMiIgeT0iNiIgZmlsbD0iI2ZmZiIgd2lkdGg9IjEiIGhlaWdodD0iNyIvPjxyZWN0IHg9IjQiIHk9IjYiIGZpbGw9IiNmZmYiIHdpZHRoPSIxIiBoZWlnaHQ9IjciLz48cmVjdCB4PSI2IiB5PSI2IiBmaWxsPSIjZmZmIiB3aWR0aD0iMSIgaGVpZ2h0PSI0Ii8%2BPC9zdmc%2B&logoWidth=8)](https://gitter.im/MithrilJS/mithril-node-render?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Build Status](https://travis-ci.org/MithrilJS/mithril-node-render.svg?branch=master)](https://travis-ci.org/MithrilJS/mithril-node-render)
[![rethink.js](https://img.shields.io/badge/rethink-js-yellow.svg)](https://github.com/rethinkjs/manifest)
[![Dependency Status](https://david-dm.org/MithrilJS/mithril-node-render.svg)](https://david-dm.org/MithrilJS/mithril-node-render)
[![devDependency Status](https://david-dm.org/MithrilJS/mithril-node-render/dev-status.svg)](https://david-dm.org/MithrilJS/mithril-node-render#info=devDependencies)

Use mithril views to render server side

Demo
----

[Usage Example](https://github.com/StephanHoyer/mithril-isomorphic-example/)

Installation
------------

```
npm install mithril-node-render
```

Usage
-----

```javascript
// Make Mithril happy
if (!global.window) {
  global.window = global.document = global.requestAnimationFrame = undefined
}

var m = require('mithril')
var render = require('mithril-node-render')

render(m('span', 'huhu')).then(function (html) {
  // html === '<span>huhu</span>'
})

var html = render.sync(m('span', 'huhu'))
// html === '<span>huhu</span>'
```

Async components
----------------

As you see the rendering is asynchronous. It lets you await certain data from within `oninit` hooks.

```javascript
var myAsyncComponent = {
  oninit: function (node, waitFor) {
    waitFor(new Promise(function (resolve) {
      node.state.foo = 'bar'
      resolve()
    }))
  },
  view: function (node) {
    return m('div', node.state.foo)
  }
}

render(myAsyncComponent).then(function (html) {
  // html === '<div>bar</div>'
})
```

Sync rendering
--------------

You can also render synchronously. You just don't get the `waitFor` callback.

```js
var myAsyncComponent = {
  oninit: function (node, waitFor) {
    // waitFor === undefined
    new Promise(function (resolve) {
      node.state.foo = 'bar'
      resolve()
    })
  },
  view: function (node) {
    return m('div', node.state.foo)
  }
}

var html = render.sync(myAsyncComponent)
// html === '<div>bar</div>'
```

Options
-------

Optionally pass in options as an object: `render(component, options)`.

The following options are supported:

**escapeAttribute(value)**
`Default: render.escapeAttribute`
A filter function for attribute values. Receives value, returns what is printed.

**escapeText(value)**
`Default: render.escapeText`
A filter function for string nodes. Receives value, returns what is printed.

**strict**
`Default: false`
Set this to true to close all empty tags automatically. Default is standard HTML mode where tags like `<br>` and `<meta>` are allowed to implicitly close themselves. This should be set to `true` if you're rendering XML-compatible HTML documents.

**xml**
`Default: false`
Set this to true to render as generic XML instead of (possibly XML-compatible) HTML. Default is HTML mode, where children of void elements are ignored. This implies `strict: true`.


See also
--------

* [Blog post](https://gist.github.com/StephanHoyer/bddccd9e159828867d2a) about isomorphic mithril applications
* [Usage Example](https://github.com/StephanHoyer/mithril-isomorphic-example/blob/master/README.md)
