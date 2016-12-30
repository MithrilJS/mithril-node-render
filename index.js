'use strict'

const co = require('co')
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

function * setHooks (component, vnode, hooks) {
  if (component.oninit) {
    yield component.oninit.call(vnode.state, vnode) || function * () {}
  }
  if (component.onremove) {
    hooks.push(component.onremove.bind(vnode.state, vnode))
  }
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

function * createChildrenContent (view, options, hooks) {
  if (view.text != null) {
    return options.escapeString(view.text)
  }
  if (isArray(view.children) && !view.children.length) {
    return ''
  }
  return yield _render(view.children, options, hooks)
}

function * render (view, attrs, options) {
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

  var result = yield _render(view, options, hooks)

  hooks.forEach(function (hook) { hook() })

  return result
}

function * _render (view, options, hooks) {
  var type = typeof view

  if (type === 'string') {
    return options.escapeString(view)
  }

  if (type === 'number' || type === 'boolean') {
    return view
  }

  if (!view) {
    return ''
  }

  if (isArray(view)) {
    var result = ''
    for (const v of view) {
      result += yield _render(v, options, hooks)
    }
    return result
  }

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
    yield setHooks(view.attrs, view, hooks)
  }

  // component
  if (isObject(view.tag)) {
    vnode = {
      state: copy(view.tag),
      children: copy(view.children),
      attrs: view.attrs
    }
    yield setHooks(view.tag, vnode, hooks)
    return yield _render(view.tag.view.call(vnode.state, vnode), options, hooks)
  }

  if (view.tag === '<') {
    return '' + view.children
  }
  var children = yield createChildrenContent(view, options, hooks)
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
}

module.exports = co.wrap(render)
module.exports.escapeHtml = escapeHtml
