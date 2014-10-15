'use strict';

var test = require('tape');
var m = require('mithril');
var render = require('./index');

test('render', function(t) {
  t.equal(render(m('span')), '<span></span>', 'should render tag');
  t.equal(render(m('.foo')), '<div class="foo"></div>', 'should render classname');
  t.equal(render(m('#bar')), '<div id="bar"></div>', 'should render id');
  t.equal(render(m('span', {
    'data-foo': 'bar',
    style: 'color: pink'
  })), '<span data-foo="bar" style="color: pink"></span>', 'should render attributes');
  t.equal(render(m('ul', 'huhu')), '<ul>huhu</ul>', 'should render string');
  t.equal(render([m('span'), m('div')]), '<span></span><div></div>', 'should render arrays');
  t.equal(render(m('span', m('div'))), '<span><div></div></span>', 'should render children');
  t.end();
});
