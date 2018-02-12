'use strict'

const m = require('mithril/hyperscript')

const VOID_TAGS = [
  'area',
  'base',
  'br',
  'col',
  'command',
  'embed',
  'hr',
  'img',
  'input',
  'keygen',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
  '!doctype'
]

const COMPONENT_PROPS = [
  'oninit',
  'view',
  'oncreate',
  'onbeforeupdate',
  'onupdate',
  'onbeforeremove',
  'onremove'
]

function isArray (thing) {
  return (
    thing !== '[object Array]' &&
    Object.prototype.toString.call(thing) === '[object Array]'
  )
}

function isObject (thing) {
  return typeof thing === 'object'
}

function isFunction (thing) {
  return typeof thing === 'function'
}

function isClassComponent (thing) {
  return thing.prototype != null && typeof thing.prototype.view === 'function'
}

function camelToDash (str) {
  return str.replace(/\W+/g, '-').replace(/([a-z\d])([A-Z])/g, '$1-$2')
}

function removeEmpties (n) {
  return n !== ''
}

function omit (source, keys) {
  keys = keys || []
  const res = Object.assign(Object.create(Object.getPrototypeOf(source)), source)
  keys.forEach(function (key) {
    if (key in res) {
      res[key] = null
    }
  })
  return res
}

const copy = omit

// shameless stolen from https://github.com/punkave/sanitize-html
function escapeHtml (s, replaceDoubleQuote) {
  if (s === 'undefined') {
    s = ''
  }
  if (typeof s !== 'string') {
    s = s + ''
  }
  s = s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  if (replaceDoubleQuote) {
    return s.replace(/"/g, '&quot;')
  }
  return s
}

async function setHooks (component, vnode, hooks) {
  if (component.oninit) {
    await (component.oninit.call(vnode.state, vnode) || async function () {})
  }
  if (component.onremove) {
    hooks.push(component.onremove.bind(vnode.state, vnode))
  }
}

function createAttrString (view, escapeAttributeValue) {
  const attrs = view.attrs

  if (!attrs || !Object.keys(attrs).length) {
    return ''
  }

  return Object.keys(attrs)
    .map(function (name) {
      const value = attrs[name]
      if (
        typeof value === 'undefined' ||
        value === null ||
        typeof value === 'function'
      ) {
        return
      }
      if (typeof value === 'boolean') {
        return value ? ' ' + name : ''
      }
      if (name === 'style') {
        if (!value) {
          return
        }
        let styles = attrs.style
        if (isObject(styles)) {
          styles = Object.keys(styles)
            .map(function (property) {
              return styles[property] !== ''
                ? [camelToDash(property).toLowerCase(), styles[property]].join(
                  ':'
                )
                : ''
            })
            .filter(removeEmpties)
            .join(';')
        }
        return styles !== ''
          ? ' style="' + escapeAttributeValue(styles, true) + '"'
          : ''
      }

      // Handle SVG <use> tags specially
      if (name === 'href' && view.tag === 'use') {
        return ' xlink:href="' + escapeAttributeValue(value, true) + '"'
      }

      return (
        ' ' +
        (name === 'className' ? 'class' : name) +
        '="' +
        escapeAttributeValue(value, true) +
        '"'
      )
    })
    .join('')
}

async function createChildrenContent (view, options, hooks) {
  if (view.text != null) {
    return options.escapeString(view.text)
  }
  if (isArray(view.children) && !view.children.length) {
    return ''
  }
  return _render(view.children, options, hooks)
}

async function render (view, attrs, options) {
  options = options || {}
  if (view.view || isFunction(view)) {
    // root component
    view = m(view, attrs)
  } else {
    options = attrs || {}
  }
  const hooks = []

  const defaultOptions = {
    escapeAttributeValue: escapeHtml,
    escapeString: escapeHtml,
    strict: false
  }

  Object.keys(defaultOptions).forEach(function (key) {
    if (!options.hasOwnProperty(key)) options[key] = defaultOptions[key]
  })

  const result = await _render(view, options, hooks)

  hooks.forEach(function (hook) {
    hook()
  })

  return result
}

async function _render (view, options, hooks) {
  const type = typeof view

  if (type === 'string') {
    return view
  }

  if (type === 'number' || type === 'boolean') {
    return view
  }

  if (!view) {
    return ''
  }

  if (isArray(view)) {
    let result = ''
    for (const v of view) {
      result += await _render(v, options, hooks)
    }
    return result
  }

  if (view.attrs) {
    await setHooks(view.attrs, view, hooks)
  }

  // component
  if (view.view || view.tag) {
    const vnode = { children: [].concat(view.children) }
    let component = view.view
    if (isObject(view.tag)) {
      component = view.tag
    } else if (isClassComponent(view.tag)) {
      component = new view.tag(vnode)
    } else if (isFunction(view.tag)) {
      component = view.tag()
    }

    if (component) {
      vnode.tag = copy(component)
      vnode.state = omit(component, COMPONENT_PROPS)
      vnode.attrs = component.attrs || view.attrs || {}

      await setHooks(component, vnode, hooks)
      return _render(component.view.call(vnode.state, vnode), options, hooks)
    }
  }

  if (view.tag === '<') {
    return '' + view.children
  }
  const children = await createChildrenContent(view, options, hooks)
  if (view.tag === '#') {
    return options.escapeString(children)
  }
  if (view.tag === '[') {
    return '' + children
  }
  if (
    !children &&
    (options.strict || VOID_TAGS.indexOf(view.tag.toLowerCase()) >= 0)
  ) {
    return (
      '<' +
      view.tag +
      createAttrString(view, options.escapeAttributeValue) +
      (options.strict ? '/' : '') +
      '>'
    )
  }
  return [
    '<',
    view.tag,
    createAttrString(view, options.escapeAttributeValue),
    '>',
    children,
    '</',
    view.tag,
    '>'
  ].join('')
}

module.exports = render
module.exports.escapeHtml = escapeHtml
