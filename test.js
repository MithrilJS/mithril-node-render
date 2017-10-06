'use strict'

var o = require('mithril/ospec/ospec')
var m = require('mithril/render/hyperscript')
var mTrust = require('mithril/render/trust')
var render = require('./index')
var co = require('co')

var ES6ClassComponent = require('./tests/fixtures/es6_class_component');
var BabelClassComponent = require('./tests/fixtures/babel_class_component');

o.async = function async (desc, genFn) {
  o(desc, function (done) {
    co(genFn).then(done)
  })
}

o.async.only = function async (desc, genFn) {
  o.only(desc, function (done) {
    co(genFn).then(done)
  })
}

o.async('render', function * () {
  o(yield render(m('span', 'content'))).equals('<span>content</span>')('should render tag')
  o(yield render(m('.foo', 'content'))).equals('<div class="foo">content</div>')('should render classname')
  o(yield render(m('#bar', 'content'))).equals('<div id="bar">content</div>')('should render id')
  o(yield render(m('br'))).equals('<br>')('should render short nodes when no children')
  o(yield render(m('HR'))).equals('<HR>')('should render short nodes when no children and tag name is uppercase')
  o(yield render(m('!doctype'))).equals('<!doctype>')('should render short node doctype')
  o(yield render(m('!doctype', {html: true}))).equals('<!doctype html>')('should render short node doctype HTML5')
  o(yield render(m('span', { 'data-foo': 'bar', selected: 'selected' }))).equals('<span data-foo="bar" selected="selected"></span>')('should render attributes')
  o(yield render(m('ul', 'huhu'))).equals('<ul>huhu</ul>')('should render string')
  o(yield render([m('span', 'foo'), m('div', 'bar')])).equals('<span>foo</span><div>bar</div>')('should render arrays')
  o(yield render(m('div', [[m('span', 'foo'), m('div', 'bar')]]))).equals('<div><span>foo</span><div>bar</div></div>')('should render nested arrays')
  o(yield render(m('span', m('div')))).equals('<span><div></div></span>')('should render children')
  o(yield render(m('span', { onmousemove: function (event) {} }))).equals('<span></span>')('should not render events')
  o(yield render(m('span', { style: { paddingLeft: '10px', color: 'red' } }))).equals('<span style="padding-left:10px;color:red"></span>')('should render children')
  o(yield render(m('div', [ 1, m('span'), '2' ]))).equals('<div>1<span></span>2</div>')('should render numbers as text nodes')
  o(yield render(m('div', 0))).equals('<div>0</div>')
  o(yield render(m('div', false))).equals('<div></div>')
  o(yield render(m('div', { a: true }))).equals('<div a></div>')
  o(yield render(m('div', { a: false }))).equals('<div></div>')
  o(yield render(m('div', { a: undefined }))).equals('<div></div>')
  o(yield render(m('div', { style: null }))).equals('<div></div>')
  o(yield render(m('div', { style: '' }))).equals('<div></div>')
  o(yield render(m('div', { style: { color: '' } }))).equals('<div></div>')
  o(yield render(m('div', { style: { height: '20px', color: '' } }))).equals('<div style="height:20px"></div>')
  o(yield render(m('div', { style: { height: '20px', color: '', width: '10px' } }))).equals('<div style="height:20px;width:10px"></div>')
  o(yield render(m('div', { a: 'foo' }))).equals('<div a="foo"></div>')
  o(yield render(m('div', mTrust('<foo></foo>')))).equals('<div><foo></foo></div>')
  o(yield render(m('div', '<foo></foo>'))).equals('<div>&lt;foo&gt;&lt;/foo&gt;</div>')
  o(yield render(m('div', { style: '"></div><div a="' }))).equals('<div style="&quot;&gt;&lt;/div&gt;&lt;div a=&quot;"></div>')
  o(yield render(m('div', { style: '"></div><div a="' }), { escapeAttributeValue: function (value) { return value } })).equals('<div style=""></div><div a=""></div>')
  o(typeof render.escapeHtml).equals('function')
  o(yield render(m('pre', 'var = ' + JSON.stringify({foo: 1})))).equals('<pre>var = {"foo":1}</pre>')
  o(yield render(m('svg', m('use', { href: 'fooga.com' })))).equals('<svg><use xlink:href="fooga.com"></use></svg>')
  o(yield render(m('input'), {strict: true})).equals('<input/>')('should render closed input-tag')
  o(yield render(m('div'), {strict: true})).equals('<div/>')('should render closed div-tag')
})

o.spec('components', function () {
  var myComponent, onremove

  o.beforeEach(function () {
    onremove = o.spy()
    myComponent = {
      oninit: function (node) {
        node.state = {
          foo: 'bar'
        }
      },
      onremove: onremove,
      view: function (node) {
        return m('div', [
          'hello',
          node.state.foo,
          node.attrs.foo
        ])
      }
    }
  })

  o.async('embedded', function * () {
    o(onremove.callCount).equals(0)
    o(yield render(m('div', m(myComponent)))).equals('<div><div>hellobar</div></div>')
    o(onremove.callCount).equals(1)
    o(yield render(m('span', m(myComponent, {foo: 'foz'})))).equals('<span><div>hellobarfoz</div></span>')
    o(yield render(m('div', m({
      oninit: function () {},
      view: function () {
        return m('span', 'huhu')
      }
    })))).equals('<div><span>huhu</span></div>')
    o(yield render(m('div', m({
      view: function () {
        return m('span', 'huhu')
      }
    })))).equals('<div><span>huhu</span></div>')
  })

  o.async('as root', function * () {
    o(yield render(myComponent)).equals('<div>hellobar</div>')
    o(yield render(myComponent, { foo: '-attr-foo' })).equals('<div>hellobar-attr-foo</div>')
  })

  o.async('with children', function * () {
    var parentComponent = {
      view: function (node) {
        return m('div', node.children)
      }
    }

    o(yield render(m(parentComponent, 'howdy'))).equals('<div>howdy</div>')
    o(yield render(m(parentComponent, m('span', 'howdy')))).equals('<div><span>howdy</span></div>')
    o(yield render(m(parentComponent, [
      m('span', 'foo'),
      m('span', 'bar')
    ]))).equals('<div><span>foo</span><span>bar</span></div>')
    o(yield render(m(parentComponent, m.trust('<span>trust me</span>')))).equals('<div><span>trust me</span></div>')
    o(yield render(m(parentComponent, m(myComponent, { foo: 'foz' })))).equals('<div><div>hellobarfoz</div></div>')
  })

  o.async('quouting html content right', function * () {
    var component = {
      view: function (node) {
        return m('span', ['huh', '> >'])
      }
    }
    var out = yield render(component)
    o(out).equals('<span>huh&gt; &gt;</span>')
  })
})

var classComponents = { es6: ES6ClassComponent, babel: BabelClassComponent }
for (var type in classComponents) {
  o.spec('component of ' + type + ' class', function () {
    var classComponent = classComponents[type];

    o.async('embedded', function * () {
      o(yield render(m('div', m(classComponent)))).equals('<div><div>hellobar</div></div>')
      o(yield render(m('span', m(classComponent, { foo: 'foz' })))).equals('<span><div>hellobarfoz</div></span>')
    })

    o.async('as root', function * () {
      o(yield render(classComponent)).equals('<div>hellobar</div>')
      o(yield render(classComponent, { foo: '-attr-foo' })).equals('<div>hellobar-attr-foo</div>')
    })
  })
}

o.async('`this` in component', function * () {
  var oninit = o.spy()
  var myComponent = {
    oninit: function (vnode) {
      oninit()
      o(this).equals(vnode.state)('vnode.state should be the context in `oninit`')
      o(this.foo).equals(undefined)('this.foo should be undefined initially')
      this.foo = 5
      o(vnode.state.bar).equals(4)('component properties should be copied to the state')
    },
    view: function (vnode) {
      o(this).equals(vnode.state)('vnode.state should be the context in the view')
      return m('div', 'hello')
    },
    onremove: function (vnode) {
      o(this).equals(vnode.state)('vnode.state should be the context in `onremove`')
    },
    bar: 4
  }

  o(yield render([m(myComponent), m(myComponent)])).equals('<div>hello</div><div>hello</div>')

  o(oninit.callCount).equals(2)('the component should have been initialized twice')
})

o.async('lifecycle hooks as attributes on elements', function * () {
  var initialized, removed
  yield render(m('p', {
    oninit: function (vnode) {
      initialized = true
      o(this).equals(vnode.state)('vnode.state should be the context in `oninit`')
    },
    onremove: function (vnode) {
      removed = true
      o(this).equals(vnode.state)('vnode.state should be the context in `onremove`')
    }
  }))
  o(initialized).equals(true)('attr.oninit should run')
  o(removed).equals(true)('attr.onremove should run')
})

o.async('lifecycle hooks as attributes on components', function * () {
  var attrInitialized, attrRemoved, tagInitialized, tagRemoved
  var myComponent = {
    oninit: function () {
      o(attrInitialized).equals(true)('`attr.oninit()` should run before `tag.oninit()`')
      tagInitialized = true
    },
    view: function () { return m('p', 'p') },
    onremove: function () {
      o(attrRemoved).equals(true)('`attr.onremove()` should run before `tag.onremove()`')
      tagRemoved = true
    }
  }
  o(yield render(m(myComponent, {
    oninit: function (vnode) {
      o(this).equals(vnode.state)('vnode.state should be the context in `attr.oninit`')
      attrInitialized = true
    },
    onremove: function (vnode) {
      o(this).equals(vnode.state)('vnode.state should be the context in `attr.onremove`')
      attrRemoved = true
    }
  }))).equals('<p>p</p>')
  o(tagInitialized).equals(true)('tag.oninit should be called')
  o(tagRemoved).equals(true)('tag.onremove should be called')
})

o.async('lifecycle hooks of class component', function * () {
  var initialized, removed
  var classComponent = class {
    constructor(vnode) {
      this.vnode = vnode;
    }
    oninit(vnode) {
      initialized = true
      o(this).equals(vnode.state)('vnode.state should be the context in `oninit`')
      o(this.vnode).equals(vnode)('vnode.state equals passed in constructor')
    }
    onremove(vnode) {
      removed = true
      o(this).equals(vnode.state)('vnode.state should be the context in `onremove`')
      o(this.vnode).equals(vnode)('vnode.state equals passed in constructor')
    }
    view(vnode) {
      o(this).equals(vnode.state)('vnode.state should be the context in `view`')
      o(this.vnode).equals(vnode)('vnode.state equals passed in constructor')
      return m('p', 'hello')
    }
  }
  o(yield render(m(classComponent))).equals('<p>hello</p>')
  o(initialized).equals(true)('classComponent#oninit should run')
  o(removed).equals(true)('classComponent#onremove should run')
})

o.async('onremove hooks should be called once the whole tree has been inititalized', function * () {
  var initialized = 0
  var onremove = o.spy()
  function oninit () {
    initialized++
    o(onremove.callCount).equals(0)
  }
  var attrs = {oninit: oninit, onremove: onremove}
  var myComponent = {
    oninit: oninit,
    view: function () {
      return m('p', attrs, 'p')
    },
    onremove: onremove
  }
  o(yield render([m(myComponent, attrs), m(myComponent, attrs)]))

  /*
  We just rendered two components, and each has three sets of hooks defined:
  one on the component object, one passed as component attributes, and one passed
  as attributes in the view. => 2 × 3 === 6
  */
  o(initialized).equals(6)('oninit should run six times')
  o(onremove.callCount).equals(6)('onremove should run six times')
})

o.async('hooks are called top-down, depth-first on elements', function * () {
  /*
   Suppose a tree with the following structure: two levels of depth,
   two components on the first depth level, the first one having a
   single child on level 2.

   +-- p
   | +-- a
   |
   +-- ul

  */
  var pInit = false
  var aInit = false
  var ulInit = false
  var pRemoved = false
  var aRemoved = false
  var ulRemoved = false
  var html = yield render([
    m(
      'p',
      {
        oninit: function () {
          pInit = true
          o(aInit).equals(false)
          o(ulInit).equals(false)
        },
        onremove: function () {
          pRemoved = true
          o(aRemoved).equals(false)
          o(ulRemoved).equals(false)
        }
      },
      m(
        'a',
        {
          oninit: function () {
            aInit = true
            o(pInit).equals(true)
            o(ulInit).equals(false)
          },
          onremove: function () {
            aRemoved = true
            o(pRemoved).equals(true)
            o(ulRemoved).equals(false)
          }
        },
        'q'
      )
    ),
    m(
      'ul',
      {
        oninit: function () {
          ulInit = true
          o(pInit).equals(true)
          o(aInit).equals(true)
        },
        onremove: function () {
          ulRemoved = true
          o(pRemoved).equals(true)
          o(aRemoved).equals(true)
        }
      },
      'r'
    )
  ])
  o(html).equals('<p><a>q</a></p><ul>r</ul>')
  o(pInit && ulInit && aInit &&
    pRemoved && ulRemoved && aRemoved).equals(true)
})

o.spec('async', function () {
  var myAsyncComponent
  o.beforeEach(function () {
    myAsyncComponent = {
      oninit: function (node) {
        return new Promise(function (resolve) {
          node.state.foo = 'bar'
          setTimeout(resolve, 10)
        })
      },
      view: function (node) {
        return m('div', node.state.foo)
      }
    }
  })

  o.async('render components', function * () {
    const html = yield render(myAsyncComponent)
    o(html).equals('<div>bar</div>')
  })

  o.async('render nodes', function * () {
    var oninitSpy = o.spy()
    const html = yield render(m('span', {
      oninit: function (node) {
        return new Promise(resolve => {
          oninitSpy()
          setTimeout(resolve, 10)
        })
      }
    }, 'foo'))
    o(html).equals('<span>foo</span>')
    o(oninitSpy.callCount).equals(1)
  })
})

o.async('render closure components', function * () {
  var closureComponent = function () {
    return {
      view: function(node) {
        return m('p','p')
      }
    }
  }
  o(yield render(closureComponent())).equals('<p>p</p>')
})

o.run()
