'use strict';

function _instanceof(left, right) { if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) { return !!right[Symbol.hasInstance](left); } else { return left instanceof right; } }

function _classCallCheck(instance, Constructor) { if (!_instanceof(instance, Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var m = require('mithril/hyperscript');

var BabelClassComponent =
/*#__PURE__*/
function () {
  function BabelClassComponent(vnode) {
    _classCallCheck(this, BabelClassComponent);

    this.vnode = vnode;
  }

  _createClass(BabelClassComponent, [{
    key: "oninit",
    value: function oninit() {
      this.vnode.state.foo = 'bar';
    }
  }, {
    key: "view",
    value: function view() {
      return m('div', ['hello', this.vnode.state.foo, this.vnode.attrs.foo]);
    }
  }]);

  return BabelClassComponent;
}();

module.exports = BabelClassComponent;
