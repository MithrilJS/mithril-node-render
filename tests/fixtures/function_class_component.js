'use strict'

const m = require('mithril/hyperscript')

function ClassComponent(vnode) {
  this.vnode = vnode
}

ClassComponent.prototype.oninit = function oninit() {
  this.vnode.state.foo = 'bar'
}

ClassComponent.prototype.view = function view() {
  return m('div', ['hello', this.vnode.state.foo, this.vnode.attrs.foo])
}

module.exports = ClassComponent;
