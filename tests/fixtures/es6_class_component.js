'use strict'
const m = require('mithril/hyperscript')

class ES6ClassComponent1 {
  constructor (vnode) {
    this.vnode = vnode
  }

  oninit () {
    this.vnode.state.foo = 'bar'
  }

  view () {
    return m('div', ['hello', this.vnode.state.foo, this.vnode.attrs.foo])
  }
}

class ES6ClassComponent2 {
  constructor (vnode, waitFor = () => {}) {
    this.vnode = vnode
    this.bar = ''
    waitFor(new Promise( (resolve) => {
      this.bar = 'bar'
      resolve()
    }))
  }

  view () {
    return m('div', ['hello', this.bar, this.vnode.attrs.foo])
  }
}

module.exports = { ES6ClassComponent1, ES6ClassComponent2 }
