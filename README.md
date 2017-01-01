Attention!
==========

If you're using mithril v1.0 (rewrite) you have to use the appropriate [version](https://github.com/StephanHoyer/mithril-node-render/tree/rewrite) of mithril-node-render.

mithril-node-render
===================
[![Gitter](https://badges.gitter.im/Join Chat.svg)](https://gitter.im/StephanHoyer/mithril-node-render?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Build Status](https://travis-ci.org/StephanHoyer/mithril-node-render.svg?branch=master)](https://travis-ci.org/StephanHoyer/mithril-node-render)
[![rethink.js](https://img.shields.io/badge/rethink-js-yellow.svg)](https://github.com/rethinkjs/manifest)
[![Dependency Status](https://david-dm.org/stephanhoyer/mithril-node-render.svg)](https://david-dm.org/stephanhoyer/mithril-node-render)
[![devDependency Status](https://david-dm.org/stephanhoyer/mithril-node-render/dev-status.svg)](https://david-dm.org/stephanhoyer/mithril-node-render#info=devDependencies)

Use mithril views to render server side.

Important note: This is the async version of mithril-node-render with a api change.
The function ```render``` returns now a Promise with the result resolved.

Usage
-----

```javascript
var m = require('mithril');
var render = require('mithril-node-render');

render(m('span', 'huhu')).then(function(x) {
  console.log(x) //<span>huhu</span>
})
```

Async Usage
-----------

For components with an async operation, oninit has to return a new Promise.

```javascript
var m = require('mithril');
var render = require('mithril-node-render');

var Component = {
  oninit: function (vnode) {
    vnode.state.foo = 'foo';

    return new Promise(function(resolve, reject) {
      setTimeout(function() {
        vnode.state.foo = 'bar';
      }, 100);
    });
  },
  view: function (vnode) {
    return m('div', vnode.state.foo);
  }
};

render(m(Component)).then(function(x) {
  console.log(x) //<div>bar</div>
})
```

Options
-------

Optionally pass in options as an object: `m.render(component, options)`.

The following options are supported:

**escapeAttributeValue(value)**
`Default: render.escapeHtml`
A filter function for attribute values. Receives value, returns what is printed.

**escapeString(value)**
`Default: render.escapeHtml`
A filter function for string nodes. Receives value, returns what is printed.

**strict**
`Default: false`
Set this to true to close all empty tags automatically. Default is HTML mode where tags like `<br>` and `<meta>` are allowed without closing tags. This is required if you're rendering XML or XHTML documents.


See also
--------

* [Blog post](https://gist.github.com/StephanHoyer/bddccd9e159828867d2a) about isomorphic mithril applications
* [Usage Example](https://github.com/StephanHoyer/mithril-isomorphic-example/blob/master/README.md)
