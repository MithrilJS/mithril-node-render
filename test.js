'use strict'

var o = require('mithril/ospec/ospec')
var m = require('mithril/render/hyperscript')
var mTrust = require('mithril/render/trust')
var render = require('./index')

function asyncTest (r, params, equals, msg, done) {
  var params = params || {}
  render(r, params).then(function(x) {
    if (msg) {
      o(x).equals(equals, msg)
    } else {
      o(x).equals(equals)
    }
    if (done) {
      done()
    }
  })
}

o('render', function (done) {
  asyncTest(m('span', 'content'), {}, '<span>content</span>', 'should render tag')
  asyncTest(m('.foo', 'content'), {}, '<div class="foo">content</div>', 'should render classname')
  asyncTest(m('#bar', 'content'), {}, '<div id="bar">content</div>', 'should render id')
  asyncTest(m('br'), {}, '<br>', 'should render short nodes when no children')
  asyncTest(m('HR'), {}, '<HR>', 'should render short nodes when no children and tag name is uppercase')
  asyncTest(m('!doctype'), {}, '<!doctype>', 'should render short node doctype')
  asyncTest(m('!doctype', {html: true}), {}, '<!doctype html>', 'should render short node doctype HTML5')
  asyncTest(m('span', { 'data-foo': 'bar', selected: 'selected' }), {}, '<span data-foo="bar" selected="selected"></span>', 'should render attributes')
  asyncTest(m('ul', 'huhu'), {}, '<ul>huhu</ul>', 'should render string')
  asyncTest([m('span', 'foo'), m('div', 'bar')], {}, '<span>foo</span><div>bar</div>', 'should render arrays')
  asyncTest(m('div', [[m('span', 'foo'), m('div', 'bar')]]), {}, '<div><span>foo</span><div>bar</div></div>', 'should render nested arrays')
  asyncTest(m('span', m('div')), {}, '<span><div></div></span>', 'should render children')
  asyncTest(m('span', { onmousemove: function (event) {} }), {}, '<span></span>', 'should not render events')
  asyncTest(m('span', { style: { paddingLeft: '10px', color: 'red' } }), {}, '<span style="padding-left:10px;color:red"></span>', 'should render children')
  asyncTest(m('div', [ 1, m('span'), '2' ]), {}, '<div>1<span></span>2</div>', 'should render numbers as text nodes')
  asyncTest(m('div', 0), {}, '<div>0</div>')
  asyncTest(m('div', false), {}, '<div>false</div>')
  asyncTest(m('div', { a: true }), {}, '<div a></div>')
  asyncTest(m('div', { a: false }), {}, '<div></div>')
  asyncTest(m('div', { a: undefined }), {}, '<div></div>')
  asyncTest(m('div', { style: null }), {}, '<div></div>')
  asyncTest(m('div', { style: '' }), {}, '<div></div>')
  asyncTest(m('div', { style: { color: '' } }), {}, '<div></div>')
  asyncTest(m('div', { style: { height: '20px', color: '' } }), {}, '<div style="height:20px"></div>')
  asyncTest(m('div', { style: { height: '20px', color: '', width: '10px' } }), {}, '<div style="height:20px;width:10px"></div>')
  asyncTest(m('div', { a: 'foo' }), {}, '<div a="foo"></div>')
  asyncTest(m('div', mTrust('<foo></foo>')), {}, '<div><foo></foo></div>')
  asyncTest(m('div', '<foo></foo>'), {}, '<div>&lt;foo&gt;&lt;/foo&gt;</div>')
  asyncTest(m('div', { style: '"></div><div a="' }), {}, '<div style="&quot;&gt;&lt;/div&gt;&lt;div a=&quot;"></div>')
  asyncTest(m('div', { style: '"></div><div a="' }), { escapeAttributeValue: function (value) { return value } }, '<div style=""></div><div a=""></div>')
  o(typeof render.escapeHtml, 'function')
  asyncTest(m('pre', 'var = ' + JSON.stringify({foo: 1})), {}, '<pre>var = {"foo":1}</pre>')
  asyncTest(m('svg', m('use', { href: 'fooga.com' })), {}, '<svg><use xlink:href="fooga.com"></use></svg>')
  asyncTest(m('input'), {strict: true}, '<input/>', 'should render closed input-tag')
  asyncTest(m('div'), {strict: true}, '<div/>', 'should render closed div-tag', done)
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

  o('embedded', function (done) {
    o(onremove.callCount, 0)
    render(m('div', m(myComponent))).then(function(x) {
      o(x).equals('<div><div>hellobar</div></div>')
      o(onremove.callCount, 1)
    })
    asyncTest(m('span', m(myComponent, {foo: 'foz'})), {}, '<span><div>hellobarfoz</div></span>')
    render(m('div', m({
      oninit: function () {},
      view: function () {
        return m('span', 'huhu')
      }
    })), {}, '<div><span>huhu</span></div>')
    render(m('div', m({
      view: function () {
        return m('span', 'huhu')
      }
    }))).then(function(x) {
      o(x).equals('<div><span>huhu</span></div>')
      done()
    })
  })

  o('as root', function (done) {
    render(myComponent).then(function(x) {
      o(x).equals('<div>hellobar</div>')
    })
    render(myComponent, { foo: '-attr-foo' }).then(function(x) {
      o(x).equals('<div>hellobar</div>')
      done()
    })
  })

  o('with children', function(done) {
    var parentComponent = {
      view: function(node) {
        return m('div', node.children)
      }
    }

    asyncTest(m(parentComponent, {}, 'howdy'), {}, '<div>howdy</div>')
    asyncTest(m(parentComponent, m('span', 'howdy')), {}, '<div><span>howdy</span></div>')
    asyncTest(m(parentComponent, [
      m('span', 'foo'),
      m('span', 'bar')
    ]), {}, '<div><span>foo</span><span>bar</span></div>')
    asyncTest(m(parentComponent, m.trust('<span>trust me</span>')), {}, '<div><span>trust me</span></div>')
    asyncTest(m(parentComponent, m(myComponent, { foo: 'foz' })), {}, '<div><div>hellobarfoz</div></div>', '', done)
  })
})

o('`this` in component', function (done) {
  var oninit = o.spy()
  var myComponent = {
    oninit: function (vnode) {
      oninit()
      o(this, vnode.state, 'vnode.state should be the context in `oninit`')
      o(this.foo, undefined, 'this.foo should be undefined initially')
      this.foo = 5
      o(vnode.state.bar, 4, 'component properties should be copied to the state')
    },
    view: function (vnode) {
      o(this, vnode.state, 'vnode.state should be the context in the view')
      return m('div', 'hello')
    },
    onremove: function (vnode) {
      o(this, vnode.state, 'vnode.state should be the context in `onremove`')
    },
    bar: 4
  }

  render([m(myComponent), m(myComponent)]).then(function(x) {
    o(x).equals('<div>hello</div><div>hello</div>')
    o(oninit.callCount, 2, 'the component should have been initialized twice')
    done()
  })
})

o('lifecycle hooks as attributes on elements', function (done) {
  var initialized, removed
  render(m('p', {
    oninit: function (vnode) {
      initialized = true
      o(this, vnode.state, 'vnode.state should be the context in `oninit`')
    },
    onremove: function (vnode) {
      removed = true
      o(this, vnode.state, 'vnode.state should be the context in `onremove`')
    }
  })).then(function() {
    o(initialized, true, 'attr.oninit should run')
    o(removed, true, 'attr.onremove should run')
    done()
  })
})

o('lifecycle hooks as attributes on components', function (done) {
  var attrInitialized, attrRemoved, tagInitialized, tagRemoved
  var myComponent = {
    oninit: function () {
      o(attrInitialized, true, '`attr.oninit()` should run before `tag.oninit()`')
      tagInitialized = true
    },
    view: function () { return m('p', 'p') },
    onremove: function () {
      o(attrRemoved, true, '`attr.onremove()` should run before `tag.onremove()`')
      tagRemoved = true
    }
  }
  render(m(myComponent, {
    oninit: function (vnode) {
      o(this, vnode.state, 'vnode.state should be the context in `attr.oninit`')
      attrInitialized = true
    },
    onremove: function (vnode) {
      o(this, vnode.state, 'vnode.state should be the context in `attr.onremove`')
      attrRemoved = true
    }
  }), {}).then(function(x) {
    o(x).equals('<p>p</p>')
    o(tagInitialized, true, 'tag.oninit should be called')
    o(tagRemoved, true, 'tag.onremove should be called')
    done()
  })
})


o('onremove hooks should be called once the whole tree has been inititalized', function (done) {
  var initialized = 0
  var onremove = o.spy()
  function oninit () {
    initialized++
    o(onremove.callCount, 0)
  }
  var attrs = {oninit: oninit, onremove: onremove}
  var myComponent = {
    oninit: oninit,
    view: function () {
      return m('p', attrs, 'p')
    },
    onremove: onremove
  }
  render([m(myComponent, attrs), m(myComponent, attrs)]).then(function() {
    // We just rendered two components, and each has three sets of hooks defined:
    // one on the component object, one passed as component attributes, and one passed
    // as attributes in the view. => 2 × 3 === 6
    o(initialized, 6, 'oninit should run six times')
    o(onremove.callCount, 6, 'onremove should run six times')
    done()
  })
})

o('hooks are called top-down, depth-first on elements', function (done) {
   // Suppose a tree with the following structure: two levels of depth,
   // two components on the first depth level, the first one having a
   // single child on level 2.

   // +-- p
   // | +-- a
   // |
   // +-- ul

  var pInit = false
  var aInit = false
  var ulInit = false
  var pRemoved = false
  var aRemoved = false
  var ulRemoved = false
  render([
    m(
      'p',
      {
        oninit: function () {
          pInit = true
          o(aInit, false)
          o(ulInit, false)
        },
        onremove: function () {
          pRemoved = true
          o(aRemoved, false)
          o(ulRemoved, false)
        }
      },
      m(
        'a',
        {
          oninit: function () {
            aInit = true
            o(pInit, true)
            o(ulInit, false)
          },
          onremove: function () {
            aRemoved = true
            o(pRemoved, true)
            o(ulRemoved, false)
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
          o(pInit, true)
          o(aInit, true)
        },
        onremove: function () {
          ulRemoved = true
          o(pRemoved, true)
          o(aRemoved, true)
        }
      },
      'r'
    )
  ]).then(function(x) {
      o(x).equals('<p><a>q</a></p><ul>r</ul>')
      o(pInit && ulInit && aInit &&
        pRemoved && ulRemoved && aRemoved, true)
      })
      done()
  })

o('component with async oninit', function (done) {
  var asyncComponent = {
      oninit: function (node) {
        node.state = {
          async: 'foo'
        }
        return new Promise(function(resolve, reject) {
          setTimeout(function() {
            node.state.async = 'bar'
            resolve()
          }, 20)
        })
      },
      onremove: o.spy(),
      view: function (node) {
        return m('div', [
          'hello',
          node.state.async
        ])
      }
    }

  asyncTest(asyncComponent, {}, '<div>hellobar</div>', 'should render after async oninit', done)
})

o.run()
