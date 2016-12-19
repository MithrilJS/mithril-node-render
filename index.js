'use strict'

const m = require('mithril/hyperscript')

const VOID_TAGS = ['area', 'base', 'br', 'col', 'command', 'embed', 'hr',
  'img', 'input', 'keygen', 'link', 'meta', 'param', 'source', 'track',
  'wbr', '!doctype']

function isArray (thing) {
  return thing !== '[object Array]' && Object.prototype.toString.call(thing) === '[object Array]'
}

function isObject (thing) {
  return typeof thing === 'object'
}

function camelToDash (str) {
  return str.replace(/\W+/g, '-')
    .replace(/([a-z\d])([A-Z])/g, '$1-$2')
}

function removeEmpties (n) {
  return n !== ''
}

// Lifted from the Mithril rewrite
function copy (source) {
  var res = source
  if (isArray(source)) {
    res = Array(source.length)
    for (var i = 0; i < source.length; i++) res[i] = source[i]
  } else if (typeof source === 'object') {
    res = {}
    for (var k in source) res[k] = source[k]
  }
  return res
}

// shameless stolen from https://github.com/punkave/sanitize-html
function escapeHtml (s, replaceDoubleQuote) {
  if (s === 'undefined') {
    s = ''
  }
  if (typeof (s) !== 'string') {
    s = s + ''
  }
  s = s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  if (replaceDoubleQuote) {
    return s.replace(/"/g, '&quot;')
  }
  return s
}

function setHooks (component, vnode, hooks) {
  if (component.onremove) {
    hooks.push(component.onremove.bind(vnode.state, vnode))
  }
  var oninit = (component.oninit || function() {}).bind(vnode.state, vnode)
  return Promise.resolve(oninit())
}

function createAttrString (view, escapeAttributeValue) {
  var attrs = view.attrs

  if (!attrs || !Object.keys(attrs).length) {
    return ''
  }

  return Object.keys(attrs).map(function (name) {
    var value = attrs[name]
    if (typeof value === 'undefined' || value === null || typeof value === 'function') {
      return
    }
    if (typeof value === 'boolean') {
      return value ? ' ' + name : ''
    }
    if (name === 'style') {
      if (!value) {
        return
      }
      var styles = attrs.style
      if (isObject(styles)) {
        styles = Object.keys(styles).map(function (property) {
          return styles[property] !== '' ? [camelToDash(property).toLowerCase(), styles[property]].join(':') : ''
        }).filter(removeEmpties).join(';')
      }
      return styles !== '' ? ' style="' + escapeAttributeValue(styles, true) + '"' : ''
    }

    // Handle SVG <use> tags specially
    if (name === 'href' && view.tag === 'use') {
      return ' xlink:href="' + escapeAttributeValue(value, true) + '"'
    }

    return ' ' + (name === 'className' ? 'class' : name) + '="' + escapeAttributeValue(value, true) + '"'
  }).join('')
}

function createChildrenContent (view, options, hooks) {
  if (view.text != null) {
    return Promise.resolve(options.escapeString(view.text))
  }
  if (isArray(view.children) && !view.children.length) {
    return Promise.resolve('')
  }
  return _render(view.children, options, hooks)
}

function render (view, attrs, options) {
  return new Promise(function (resolve, reject) {
    options = options || {}
    if (view.view) { // root component
      view = m(view, attrs)
    } else {
      options = attrs || {}
    }
    var hooks = []

    var defaultOptions = {
      escapeAttributeValue: escapeHtml,
      escapeString: escapeHtml,
      strict: false
    }

    Object.keys(defaultOptions).forEach(function (key) {
      if (!options.hasOwnProperty(key)) options[key] = defaultOptions[key]
    })

    _render(view, options, hooks)
      .then(function (x) {
        hooks.forEach(function (hook) { hook() })
        resolve(x)
      })
  })
}

function _render (view, options, hooks) {
  return new Promise(function(resolve, reject) {
    var type = typeof view

    if (type === 'string') {
      return resolve(options.escapeString(view))
    }

    if (type === 'number' || type === 'boolean') {
      return resolve(view)
    }

    if (!view) {
      return resolve('')
    }

    if (isArray(view)) {
      var promises = view.map(function (view) { return _render(view, options, hooks) })
      Promise.all(promises)
        .then(function(x) {
          resolve(x.join(''))
        })
    } else {
      var component, vnode
      if (isObject(view.tag)) { // embedded component
        component = view.tag
        vnode = {
          state: copy(component),
          children: copy(view.children),
          attrs: view.attrs || {}
        }
      } else if (view.view) { // root component
        component = view
        vnode = {
          state: copy(component),
          children: copy(view.children),
          attrs: options.attrs || {}
        }
      }

      if (view.attrs) {
        setHooks(view.attrs, view, hooks)
          .then(function() {
            _renderSubComponent(resolve, view, vnode, options, hooks)
          })
      } else {
        _renderSubComponent(resolve, view, vnode, options, hooks)
      }
    }
  })
}

function _renderSubComponent (resolve, view, vnode, options, hooks) {
    // component
    if (isObject(view.tag)) {
      var vnode = {
        state: copy(view.tag),
        children: copy(view.children),
        attrs: view.attrs
      }
      setHooks(view.tag, vnode, hooks)
        .then(function() {
          return _render(view.tag.view.call(vnode.state, vnode), options, hooks)
        })
        .then(function(x) {
          resolve(x)
        })
    } else {
      if (view.tag === '<') {
        return resolve('' + view.children)
      }

      createChildrenContent(view, options, hooks)
        .then(function (children) {
          if (view.tag === '#') {
            return options.escapeString(children)
          }
          if (view.tag === '[') {
            return '' + children
          }
          if (!children && (options.strict || VOID_TAGS.indexOf(view.tag.toLowerCase()) >= 0)) {
            return '<' + view.tag + createAttrString(view, options.escapeAttributeValue) + (options.strict ? '/' : '') + '>'
          }
          return [
            '<', view.tag, createAttrString(view, options.escapeAttributeValue), '>',
            children,
            '</', view.tag, '>'
          ].join('')
        })
        .then(function(result) {
          resolve(result)
        })
      }
}

render.escapeHtml = escapeHtml

module.exports = render
