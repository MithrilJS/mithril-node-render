'use strict'

var VOID_TAGS = ['area', 'base', 'br', 'col', 'command', 'embed', 'hr',
  'img', 'input', 'keygen', 'link', 'meta', 'param', 'source', 'track',
  'wbr', '!doctype']

function isArray (thing) {
  return thing !== '[object Array]' && Object.prototype.toString.call(thing) === '[object Array]'
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

function setHooks (view, hooks) {
  if (view.attrs && typeof view.attrs.oninit === 'function') view.attrs.oninit.call(view.state, view)
  if (typeof view.tag !== 'string' && typeof view.tag.oninit === 'function') view.tag.oninit.call(view.state, view)

  if (view.attrs && typeof view.attrs.onremove === 'function') hooks.push(view.attrs.onremove.bind(view.state, view))
  if (typeof view.tag !== 'string' && typeof view.tag.onremove === 'function') hooks.push(view.tag.onremove.bind(view.state, view))
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
      if (typeof styles === 'object') {
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
    return options.escapeString(view.text)
  }
  if (isArray(view.children) && !view.children.length) {
    return ''
  }

  return _render(view.children, options, hooks)
}

function render (view, options) {
  options = options || {}
  var hooks = []

  var defaultOptions = {
    escapeAttributeValue: escapeHtml,
    escapeString: escapeHtml,
    strict: false
  }

  Object.keys(defaultOptions).forEach(function (key) {
    if (!options.hasOwnProperty(key)) options[key] = defaultOptions[key]
  })

  var result = _render(view, options, hooks)

  hooks.forEach(function (hook) { hook() })

  return result
}

function _render (view, options, hooks) {
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
    return view.map(function (view) { return _render(view, options, hooks) }).join('')
  }

  // component
  if (typeof view.tag === 'object' && view.tag.view) {
    view.state = copy(view.tag)
    setHooks(view, hooks)
    return _render(view.tag.view.call(view.state, view), options, hooks)
  }

  setHooks(view, hooks)

  if (view.tag === '<') {
    return '' + view.children
  }
  var children = createChildrenContent(view, options, hooks)
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

render.escapeHtml = escapeHtml

module.exports = render
