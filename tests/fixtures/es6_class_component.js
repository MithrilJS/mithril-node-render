"use strict";
const m = require('mithril/hyperscript')

class ES6ClassComponent {
  constructor (vnode) {
    this.vnode = vnode;
  }

  view () {
    return m('div', 'hello-es6-class!!');
  }
}

module.exports = ES6ClassComponent;
