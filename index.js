'use strict'

var VOID_TAGS = ['area', 'base', 'br', 'col', 'command', 'embed', 'hr',
  'img', 'input', 'keygen', 'link', 'meta', 'param', 'source', 'track',
  'wbr', '!doctype']

function isArray (thing) {
  return Object.prototype.toString.call(thing) === '[object Array]'
}

function camelToDash (str) {
  return str.replace(/\W+/g, '-')
    .replace(/([a-z\d])([A-Z])/g, '$1-$2')
}

function removeEmpties (n) {
  return n !== ''
}

// shameless stolen from https://github.com/punkave/sanitize-html
function escapeHtml (s, replaceDoubleQuote) {
  if (s === 'undefined') {
    s = ''
  }
  if (typeof (s) !== 'string') {
    s = s + ''
  }
  s = s.replace(/\&/g, '&amp;').replace(/</g, '&lt;').replace(/\>/g, '&gt;')
  if (replaceDoubleQuote) {
    return s.replace(/\"/g, '&quot;')
  }
  return s
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

function createChildrenContent (view) {
  if (isArray(view.children) && !view.children.length) {
    return ''
  }

  return render(view.children)
}

function render (view, options) {
  options = options || {}

  var defaultOptions = {
    escapeAttributeValue: escapeHtml,
    escapeString: escapeHtml
  }

  Object.keys(defaultOptions).forEach(function (key) {
    if (!options.hasOwnProperty(key)) options[key] = defaultOptions[key]
  })

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
    return view.map(function (view) { return render(view, options) }).join('')
  }

  // compontent
  if (view.view) {
    var scope = view.controller ? new view.controller() : {}
    var result = render(view.view(scope), options)
    if (scope.onunload) {
      scope.onunload()
    }
    return result
  }

  if (view.$trusted) {
    return '' + view
  }
  var children = createChildrenContent(view)
  if (!children && VOID_TAGS.indexOf(view.tag.toLowerCase()) >= 0) {
    return '<' + view.tag + createAttrString(view, options.escapeAttributeValue) + '>'
  }
  return [
    '<', view.tag, createAttrString(view, options.escapeAttributeValue), '>',
    children,
    '</', view.tag, '>'
  ].join('')
}

render.escapeHtml = escapeHtml

module.exports = render
