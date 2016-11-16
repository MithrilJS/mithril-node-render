'use strict'

var o = require('mithril/ospec/ospec')
var m = require('mithril/render/hyperscript')
var mTrust = require('mithril/render/trust')
var render = require('./index')

o('render', function () {
  o(render(m('span', 'content'))).equals('<span>content</span>')('should render tag')
  o(render(m('.foo', 'content'))).equals('<div class="foo">content</div>')('should render classname')
  o(render(m('#bar', 'content'))).equals('<div id="bar">content</div>')('should render id')
  o(render(m('br'))).equals('<br>')('should render short nodes when no children')
  o(render(m('HR'))).equals('<HR>')('should render short nodes when no children and tag name is uppercase')
  o(render(m('!doctype'))).equals('<!doctype>')('should render short node doctype')
  o(render(m('!doctype', {html: true}))).equals('<!doctype html>')('should render short node doctype HTML5')
  o(render(m('span', { 'data-foo': 'bar', selected: 'selected' }))).equals('<span data-foo="bar" selected="selected"></span>')('should render attributes')
  o(render(m('ul', 'huhu'))).equals('<ul>huhu</ul>')('should render string')
  o(render([m('span', 'foo'), m('div', 'bar')])).equals('<span>foo</span><div>bar</div>')('should render arrays')
  o(render(m('div', [[m('span', 'foo'), m('div', 'bar')]]))).equals('<div><span>foo</span><div>bar</div></div>')('should render nested arrays')
  o(render(m('span', m('div')))).equals('<span><div></div></span>')('should render children')
  o(render(m('span', { onmousemove: function (event) {} }))).equals('<span></span>')('should not render events')
  o(render(m('span', { style: { paddingLeft: '10px', color: 'red' } }))).equals('<span style="padding-left:10px;color:red"></span>')('should render children')
  o(render(m('div', [ 1, m('span'), '2' ]))).equals('<div>1<span></span>2</div>')('should render numbers as text nodes')
  o(render(m('div', 0))).equals('<div>0</div>')
  o(render(m('div', false))).equals('<div>false</div>')
  o(render(m('div', { a: true }))).equals('<div a></div>')
  o(render(m('div', { a: false }))).equals('<div></div>')
  o(render(m('div', { a: undefined }))).equals('<div></div>')
  o(render(m('div', { style: null }))).equals('<div></div>')
  o(render(m('div', { style: '' }))).equals('<div></div>')
  o(render(m('div', { style: { color: '' } }))).equals('<div></div>')
  o(render(m('div', { style: { height: '20px', color: '' } }))).equals('<div style="height:20px"></div>')
  o(render(m('div', { style: { height: '20px', color: '', width: '10px' } }))).equals('<div style="height:20px;width:10px"></div>')
  o(render(m('div', { a: 'foo' }))).equals('<div a="foo"></div>')
  o(render(m('div', mTrust('<foo></foo>')))).equals('<div><foo></foo></div>')
  o(render(m('div', '<foo></foo>'))).equals('<div>&lt;foo&gt;&lt;/foo&gt;</div>')
  o(render(m('div', { style: '"></div><div a="' }))).equals('<div style="&quot;&gt;&lt;/div&gt;&lt;div a=&quot;"></div>')
  o(render(m('div', { style: '"></div><div a="' }), { escapeAttributeValue: function (value) { return value } })).equals('<div style=""></div><div a=""></div>')
  o(typeof render.escapeHtml).equals('function')
  o(render(m('pre', 'var = ' + JSON.stringify({foo: 1})))).equals('<pre>var = {"foo":1}</pre>')
  o(render(m('svg', m('use', { href: 'fooga.com' })))).equals('<svg><use xlink:href="fooga.com"></use></svg>')
  o(render(m('input'), {strict: true})).equals('<input/>')('should render closed input-tag')
  o(render(m('div'), {strict: true})).equals('<div/>')('should render closed div-tag')
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

  o('embedded', function () {
    o(onremove.callCount).equals(0)
    o(render(m('div', m(myComponent)))).equals('<div><div>hellobar</div></div>')
    o(onremove.callCount).equals(1)
    o(render(m('span', m(myComponent, {foo: 'foz'})))).equals('<span><div>hellobarfoz</div></span>')
    o(render(m('div', m({
      oninit: function () {},
      view: function () {
        return m('span', 'huhu')
      }
    })))).equals('<div><span>huhu</span></div>')
    o(render(m('div', m({
      view: function () {
        return m('span', 'huhu')
      }
    })))).equals('<div><span>huhu</span></div>')
  })

  o('as root', function () {
    o(render(myComponent)).equals('<div>hellobar</div>')
    o(render(myComponent, { foo: '-attr-foo' })).equals('<div>hellobar-attr-foo</div>')
  })
})

o('`this` in component', function () {
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

  o(render([m(myComponent), m(myComponent)])).equals('<div>hello</div><div>hello</div>')

  o(oninit.callCount).equals(2)('the component should have been initialized twice')
})

o('lifecycle hooks as attributes on elements', function () {
  var initialized, removed
  render(m('p', {
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

o('lifecycle hooks as attributes on components', function () {
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
  o(render(m(myComponent, {
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

o('onremove hooks should be called once the whole tree has been inititalized', function () {
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
  o(render([m(myComponent, attrs), m(myComponent, attrs)]))

  /*
  We just rendered two components, and each has three sets of hooks defined:
  one on the component object, one passed as component attributes, and one passed
  as attributes in the view. => 2 × 3 === 6
  */
  o(initialized).equals(6)('oninit should run six times')
  o(onremove.callCount).equals(6)('onremove should run six times')
})

o('hooks are called top-down, depth-first on elements', function () {
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
  o(render([
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
  ])).equals('<p><a>q</a></p><ul>r</ul>')
  o(pInit && ulInit && aInit &&
    pRemoved && ulRemoved && aRemoved).equals(true)
})

o.run()
