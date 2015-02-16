mithril-node-render
===================
[![Gitter](https://badges.gitter.im/Join Chat.svg)](https://gitter.im/StephanHoyer/mithril-node-render?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Build Status](https://travis-ci.org/StephanHoyer/mithril-node-render.svg?branch=master)](https://travis-ci.org/StephanHoyer/mithril-node-render)

Use mithril views to render server side

Usage
-----

```javascript
var m = require('mithril');
var render = require('mithril-node-render');

render(m('span', 'huhu')) //<span>huhu</span>
```

See also
--------

* [Blog post](https://gist.github.com/StephanHoyer/bddccd9e159828867d2a) about isomorphic mithril applications
* [Usage Example](https://github.com/StephanHoyer/mithril-isomorphic-example/blob/master/README.md)
