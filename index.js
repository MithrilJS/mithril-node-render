'use strict'

const m = require('mithril/hyperscript')
const Vnode = require('mithril/render/vnode')

const VOID_TAGS = new RegExp('^(?:' +
  'area|' +
  'base|' +
  'br|' +
  'col|' +
  'command|' +
  'embed|' +
  'hr|' +
  'img|' +
  'input|' +
  'keygen|' +
  'link|' +
  'meta|' +
  'param|' +
  'source|' +
  'track|' +
  'wbr|' +
  '!doctype' +
')$', 'i')

const hasOwn = {}.hasOwnProperty

function toStyleKey (str) {
  return str
    .replace(/\W+/g, '-')
    .replace(/([a-z\d])([A-Z])/g, '$1-$2')
    .toLowerCase()
}

function replaceHtml (m) {
  if (m === '&') return '&amp;'
  if (m === '<') return '&lt;'
  return '&gt;'
}

function replaceAttribute (m) {
  if (m === '&') return '&amp;'
  if (m === '<') return '&lt;'
  if (m === '>') return '&gt;'
  return '&quot;'
}

const defaults = {
  escapeText (s) {
    return s.replace(/[&<>]/g, replaceHtml)
  },

  escapeAttribute (s) {
    return s.replace(/[&<>"]/g, replaceAttribute)
  }
}

function bindOpt (options, key) {
  return options[key] ? options[key].bind(options) : defaults[key]
}

function render (view, attrs, options) {
  // Fast-path a very simple case. Also lets me perform some renderer
  // optimizations.
  if (view == null) return ''
  if (view.view || typeof view === 'function') {
    // root component
    view = m(view, attrs)
    options = options || {}
  } else {
    options = attrs || {}
  }
  const hooks = []
  let result = ''
  const escapeAttribute = bindOpt(options, 'escapeAttribute')
  const escapeText = bindOpt(options, 'escapeText')
  const xml = !!options.xml
  const strict = xml || !!options.strict

  function write (value) {
    result = '' + result + value
  }

  function setHooks (source, vnode) {
    if (source.oninit) {
      source.oninit.call(vnode.state, vnode)
    }
    if (source.onremove) {
      hooks.push(source.onremove.bind(vnode.state, vnode))
    }
  }

  function createAttrString (view) {
    for (const key in view.attrs) {
      if (hasOwn.call(view.attrs, key)) {
        let value = view.attrs[key]
        if (value == null || typeof value === 'function') continue
        const name = key === 'className' ? 'class' : key

        if (name === 'style' && typeof value === 'object') {
          const styles = value
          const props = []
          for (const key of Object.keys(styles)) {
            const prop = styles[key]
            if (prop) props.push(`${toStyleKey(key)}:${prop}`)
          }
          if (!props.length) continue
          value = props.join(';')
        }

        if (typeof value === 'boolean') {
          if (xml) value = value ? 'true' : 'false'
          else if (!value) continue
          else value = ''
        } else {
          value = '' + value
        }

        write(` ${name}`)
        if (strict || value !== '') {
          write(`="${escapeAttribute(value)}"`)
        }
      }
    }
  }

  function renderComponent (vnode) {
    if (typeof vnode.tag !== 'function') {
      vnode.state = Object.create(vnode.tag)
    } else if (vnode.tag.prototype && vnode.tag.prototype.view) {
      vnode.state = new vnode.tag(vnode)
    } else {
      vnode.state = vnode.tag(vnode)
    }

    setHooks(vnode.state, vnode)
    if (vnode.attrs != null) setHooks(vnode.attrs, vnode)
    vnode.instance = Vnode.normalize(vnode.state.view(vnode))
    if (vnode.instance != null) renderNode(vnode.instance)
  }

  function renderElement (vnode) {
    write(`<${vnode.tag}`)
    createAttrString(vnode)
    // Don't write children for void HTML elements
    if (!xml && VOID_TAGS.test(vnode.tag)) {
      write(strict ? '/>' : '>')
    } else {
      write('>')
      if (vnode.text != null) {
        const text = '' + vnode.text
        if (text !== '') write(escapeText(text))
      } else {
        renderChildren(vnode.children)
      }
      write(`</${vnode.tag}>`)
    }
  }

  function renderChildren (vnodes) {
    for (const v of vnodes) {
      if (v != null) renderNode(v)
    }
  }

  function renderNode (vnode) {
    if (vnode == null) return
    if (typeof vnode.tag === 'string') {
      vnode.state = {}
      if (vnode.attrs != null) setHooks(vnode.attrs, vnode)
      switch (vnode.tag) {
        case '#': write(escapeText('' + vnode.children)); break
        case '<': write(vnode.children); break
        case '[': renderChildren(vnode.children); break
        default: renderElement(vnode)
      }
    } else {
      renderComponent(vnode)
    }
  }

  renderNode(Vnode.normalize(view))

  for (const hook of hooks) hook()
  return result.concat() // hint to flatten
}

module.exports = render
module.exports.escapeText = defaults.escapeText
module.exports.escapeAttribute = defaults.escapeAttribute
