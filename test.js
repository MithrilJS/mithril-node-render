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
})

o('components', function () {
  var onremove = o.spy()
  var myComponent = {
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

o.run()
