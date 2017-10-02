"use strict";
const m = require('mithril/hyperscript')

class ES6ClassComponent {
  constructor (vnode) {
    this.vnode = vnode;
  }

  oninit() {
    this.vnode.state.foo = 'bar';
  }

  view() {
    return m('div', ['hello', this.vnode.state.foo, this.vnode.attrs.foo]);
  }
}

module.exports = ES6ClassComponent;
