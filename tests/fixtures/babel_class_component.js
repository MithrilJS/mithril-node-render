"use strict";
const m = require('mithril/hyperscript')

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BabelClassComponent = function () {
  function BabelClassComponent(vnode) {
    _classCallCheck(this, BabelClassComponent);

    this.vnode = vnode;
  }

  _createClass(BabelClassComponent, [{
    key: 'oninit',
    value: function oninit() {
      this.vnode.state.foo = 'bar';
    }
  }, {
    key: 'view',
    value: function view() {
      return m('div', ['hello', this.vnode.state.foo, this.vnode.attrs.foo]);
    }
  }]);

  return BabelClassComponent;
}();

module.exports = BabelClassComponent;
