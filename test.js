'use strict';

var test = require('tape');
var m = require('mithril');
var render = require('./index');

test('render', function(t) {
  t.equal(render(m('span', 'content')),
    '<span>content</span>', 'should render tag');
  t.equal(render(m('.foo', 'content')),
    '<div class="foo">content</div>', 'should render classname');
  t.equal(render(m('#bar', 'content')),
    '<div id="bar">content</div>', 'should render id');
  t.equal(render(m('br')), '<br />', 'should render short nodes when no children');
  t.equal(render(m('span', {
    'data-foo': 'bar',
    selected: 'selected'
  })), '<span data-foo="bar" selected="selected" />', 'should render attributes');
  t.equal(render(m('ul', 'huhu')), '<ul>huhu</ul>', 'should render string');
  t.equal(render([m('span', 'foo'), m('div', 'bar')]),
    '<span>foo</span><div>bar</div>', 'should render arrays');
  t.equal(render(m('span', m('div'))), '<span><div /></span>', 'should render children');
  t.equal(render(m('span', {
    onmousemove: function(event) {}
  })), '<span />', 'should not render events');
  t.equal(render(m('span', {
    style: {
      paddingLeft: '10px',
      color: 'red'
    }
  })), '<span style="padding-left:10px;color:red" />', 'should render children');
  t.end();
});
