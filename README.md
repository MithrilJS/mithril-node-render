mithril-node-render
===================
[![Gitter](https://img.shields.io/badge/gitter-join_chat-1dce73.svg?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4NCjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB4PSIwIiB5PSI1IiBmaWxsPSIjZmZmIiB3aWR0aD0iMSIgaGVpZ2h0PSI1Ii8%2BPHJlY3QgeD0iMiIgeT0iNiIgZmlsbD0iI2ZmZiIgd2lkdGg9IjEiIGhlaWdodD0iNyIvPjxyZWN0IHg9IjQiIHk9IjYiIGZpbGw9IiNmZmYiIHdpZHRoPSIxIiBoZWlnaHQ9IjciLz48cmVjdCB4PSI2IiB5PSI2IiBmaWxsPSIjZmZmIiB3aWR0aD0iMSIgaGVpZ2h0PSI0Ii8%2BPC9zdmc%2B&logoWidth=8)](https://gitter.im/MithrilJS/mithril-node-render?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Build Status](https://travis-ci.org/MithrilJS/mithril-node-render.svg?branch=master)](https://travis-ci.org/MithrilJS/mithril-node-render)
[![rethink.js](https://img.shields.io/badge/rethink-js-yellow.svg)](https://github.com/rethinkjs/manifest)
[![Dependency Status](https://david-dm.org/MithrilJS/mithril-node-render.svg)](https://david-dm.org/MithrilJS/mithril-node-render)
[![devDependency Status](https://david-dm.org/MithrilJS/mithril-node-render/dev-status.svg)](https://david-dm.org/MithrilJS/mithril-node-render#info=devDependencies)

Use mithril views to render server side

Installation
------------

`mithril` is a peer dependency of `mithril-node-render`, so if you are starting a new project you should install them both:

```sh
npm install mithril mithril-node-render
```

If you have already installed `mithril`, you can just do:

```sh
npm install mithril-node-render
```

Usage
-----

```javascript
// use a mock DOM so we can run mithril on the server
require('mithril/test-utils/browserMock')(global);

const m = require('mithril');
const render = require('mithril-node-render');

render(m('span', 'huhu')).then(function (html) {
  // html === '<span>huhu</span>'
})
```

Please see [the `mithril-isomorphic-example` repo](https://github.com/StephanHoyer/mithril-isomorphic-example/blob/master/README.md) for a full example.

Asynchronous Rendering
----------------------

`mithril-node-render` peforms all rendering asynchronously.

During the rendering process, if a component returns a promise from its
[`oninit` lifecycle hook][], the renderer will wait for the promise to resolve before
rendering the component:

```javascript
const AsyncComponent = {
  oninit(node) {
    return new Promise(resolve => {
        node.state.foo = 'bar'
        resolve()
      })
    },

  view(node) {
      return m('div', node.state.foo)
    }
  }

render(myAsyncComponent).then(html => {
    // html === '<div>bar</div>'
  }
```

Using [`async`/`await` syntax][] can make this even cleaner:


```javascript
const AsyncComponent = {
  async oninit(node) {
    node.state.foo = await fetchRemoteData();
  },

  view(node) {
    return m('div', node.state.foo)
  }
}

// Then with e.g. Koa:
app.use(async ctx => {
  ctx.body = await render(myAsyncComponent);
})
```

[`oninit` lifecycle hook]: https://mithril.js.org/lifecycle-methods.html#oninit
[`async`/`await` syntax]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function

API
---

### `render(component[, options]) => Promise<string>`

Argument                       | Type                        | Default                                | Description
-------------------------------|-----------------------------|----------------------------------------|--------------------------------
`component`                    | `Component|null`            | **This argument is required.**         | The [Mithril Component][] to be rendered.
`options.strict`               | `boolean`                   | `false`                                | Controls whether output should follow XML/XHTML syntax (`true`) or HTML syntax (`false`).<br><br>When `true`, empty tags like `<br>` and `<meta>` will be output as self-closing, i.e. `<br />` and `<meta />`.
`options.escapeAttributeValue` | `(value: any) => string`    | `render.escapeHtml`                    | Function to use for [escaping attribute values][].
`options.escapeString`         | `(value: string) => string` | `render.escapeHtml`                    | Function to use for escaping [text vnodes][].


**Returns:** A `Promise` that resolves to a `string` containing the rendered HTML.

[Mithril Component]: https://mithril.js.org/components.html
[escaping attribute values]: https://www.owasp.org/index.php/XSS_(Cross_Site_Scripting)_Prevention_Cheat_Sheet#RULE_.232_-_Attribute_Escape_Before_Inserting_Untrusted_Data_into_HTML_Common_Attributes
[text vnodes]: https://mithril.js.org/vnodes.html#vnode-types

----

### `render.escapeHtml(value) => string`

Argument    | Type     | Default     | Description
------------|----------|-------------|-------------
`value`     | `any`    | `undefined` | The value to be escaped.

**Returns:** A `string` containing an HTML-escaped version of the original value.



See also
--------

* [Blog post](https://gist.github.com/StephanHoyer/bddccd9e159828867d2a) about isomorphic mithril applications
* [Usage Example](https://github.com/StephanHoyer/mithril-isomorphic-example/blob/master/README.md)
