'use strict'

const o = require('ospec')
const m = require('mithril/hyperscript')
const render = require('./index')

const ES6ClassComponent = require('./tests/fixtures/es6_class_component')
const BabelClassComponent = require('./tests/fixtures/babel_class_component')
const FunctionClassComponent = require('./tests/fixtures/function_class_component')

o.spec('render', () => {
  o('should render tag', () => {
    o(render.sync(m('span', 'content'))).equals('<span>content</span>')
  })
  o('should render classname', () => {
    o(render.sync(m('.foo', 'content'))).equals(
      '<div class="foo">content</div>'
    )()
  })

  o('should render id', () => {
    o(render.sync(m('#bar', 'content'))).equals('<div id="bar">content</div>')()
  })

  o('should render short nodes when no children', () => {
    o(render.sync(m('br'))).equals('<br>')()
  })

  o(
    'should render short nodes when no children and tag name is uppercase',
    () => {
      o(render.sync(m('HR'))).equals('<HR>')()
    }
  )

  o('should render short node doctype', () => {
    o(render.sync(m('!doctype'))).equals('<!doctype>')()
  })

  o('should render short node doctype HTML5', () => {
    o(render.sync(m('!doctype', { html: true }))).equals('<!doctype html>')()
  })

  o('should render attributes', () => {
    o(
      render.sync(m('span', { 'data-foo': 'bar', selected: 'selected' }))
    ).equals('<span data-foo="bar" selected="selected"></span>')()
  })

  o('should render string', () => {
    o(render.sync(m('ul', 'huhu'))).equals('<ul>huhu</ul>')()
  })

  o('should render arrays', () => {
    o(render.sync([m('span', 'foo'), m('div', 'bar')])).equals(
      '<span>foo</span><div>bar</div>'
    )()
  })

  o('should render nested arrays', () => {
    o(render.sync(m('div', [[m('span', 'foo'), m('div', 'bar')]]))).equals(
      '<div><span>foo</span><div>bar</div></div>'
    )()
  })

  o('should render children', () => {
    o(render.sync(m('span', m('div')))).equals('<span><div></div></span>')()
  })

  o('should not render events', () => {
    o(render.sync(m('span', { onmousemove() {} }))).equals('<span></span>')()
  })

  o('should render simple styles', () => {
    o(
      render.sync(
        m('div', { style: { height: '20px', color: '', width: '10px' } })
      )
    ).equals('<div style="height:20px;width:10px"></div>')
  })

  o('should render camelcase styles', () => {
    o(
      render.sync(m('span', { style: { paddingLeft: '10px', color: 'red' } }))
    ).equals('<span style="padding-left:10px;color:red"></span>')
  })

  o('should render numbers as text nodes', () => {
    o(render.sync(m('div', [1, m('span'), '2']))).equals(
      '<div>1<span></span>2</div>'
    )
  })

  o('renders attributes', () => {
    o(render.sync(m('div', 0))).equals('<div>0</div>')
    o(render.sync(m('div', false))).equals('<div></div>')
    o(render.sync(m('div', { a: true }))).equals('<div a></div>')
    o(render.sync(m('div', { a: false }))).equals('<div></div>')
    o(render.sync(m('div', { a: undefined }))).equals('<div></div>')
    o(render.sync(m('div', { a: 1 }))).equals('<div a="1"></div>')
    o(render.sync(m('div', { key: 1 }))).equals('<div></div>')
    o(render.sync(m('div', { style: null }))).equals('<div></div>')
    o(render.sync(m('div', { style: '' }))).equals('<div style></div>')
    o(render.sync(m('div', { style: { color: '' } }))).equals('<div></div>')
    o(render.sync(m('div', { style: { height: '20px', color: '' } }))).equals(
      '<div style="height:20px"></div>'
    )

    o(
      render.sync(
        m('div', { style: { height: '20px', color: '', width: '10px' } })
      )
    ).equals('<div style="height:20px;width:10px"></div>')
    o(render.sync(m('div', { a: 'foo' }))).equals('<div a="foo"></div>')
    o(render.sync(m('div', m.trust('<foo></foo>')))).equals(
      '<div><foo></foo></div>'
    )
    o(render.sync(m('div', '<foo></foo>'))).equals(
      '<div>&lt;foo&gt;&lt;/foo&gt;</div>'
    )
    o(render.sync(m('div', { style: '"></div><div a="' }))).equals(
      '<div style="&quot;&gt;&lt;/div&gt;&lt;div a=&quot;"></div>'
    )
    o(
      render.sync(m('div', { style: '"></div><div a="' }), {
        escapeAttribute(value) {
          return value
        },
      })
    ).equals('<div style=""></div><div a=""></div>')
    o(render.sync(m('pre', 'var = ' + JSON.stringify({ foo: 1 })))).equals(
      '<pre>var = {"foo":1}</pre>'
    )
  })

  o('renders svg xlink:href correctly', () => {
    o(render.sync(m('svg', m('use', { href: 'fooga.com' })))).equals(
      '<svg><use href="fooga.com"></use></svg>'
    )
    o(render.sync(m('svg', m('use', { 'xlink:href': 'fooga.com' })))).equals(
      '<svg><use xlink:href="fooga.com"></use></svg>'
    )
  })

  o('should render closed input-tag', () => {
    o(render.sync(m('input'), { strict: true })).equals('<input/>')
    o(render.sync(m('input'), { strict: true, xml: true })).equals(
      '<input></input>'
    )
  })
  o('should render closed div-tag', () => {
    o(render.sync(m('div'), { strict: true })).equals('<div></div>')
    o(render.sync(m('div'), { strict: true, xml: true })).equals('<div></div>')
  })
})

o.spec('components', () => {
  let myComponent, onremove

  o.beforeEach(() => {
    onremove = o.spy()
    myComponent = {
      oninit(node) {
        node.state.foo = 'bar'
      },
      onremove,
      view(node) {
        return m('div', ['hello', node.state.foo, node.attrs.foo])
      },
    }
  })

  o('embedded', () => {
    o(onremove.callCount).equals(0)
    o(render.sync(m('div', m(myComponent)))).equals(
      '<div><div>hellobar</div></div>'
    )
    o(onremove.callCount).equals(1)
    o(render.sync(m('span', m(myComponent, { foo: 'foz' })))).equals(
      '<span><div>hellobarfoz</div></span>'
    )
    o(
      render.sync(
        m(
          'div',
          m({
            oninit() {},
            view() {
              return m('span', 'huhu')
            },
          })
        )
      )
    ).equals('<div><span>huhu</span></div>')
    o(
      render.sync(
        m(
          'div',
          m({
            view() {
              return m('span', 'huhu')
            },
          })
        )
      )
    ).equals('<div><span>huhu</span></div>')
  })

  o('as root', () => {
    o(render.sync(myComponent)).equals('<div>hellobar</div>')
    o(render.sync(myComponent, { foo: '-attr-foo' })).equals(
      '<div>hellobar-attr-foo</div>'
    )
  })

  o('with children', () => {
    const parentComponent = {
      view(node) {
        return m('div', node.children)
      },
    }

    o(render.sync(m(parentComponent, 'howdy'))).equals('<div>howdy</div>')
    o(render.sync(m(parentComponent, m('span', 'howdy')))).equals(
      '<div><span>howdy</span></div>'
    )
    o(
      render.sync(m(parentComponent, [m('span', 'foo'), m('span', 'bar')]))
    ).equals('<div><span>foo</span><span>bar</span></div>')
    o(render.sync(m(parentComponent, m.trust('<span>trust me</span>')))).equals(
      '<div><span>trust me</span></div>'
    )
    o(render.sync(m(parentComponent, m(myComponent, { foo: 'foz' })))).equals(
      '<div><div>hellobarfoz</div></div>'
    )
  })

  o('quouting html content right', () => {
    const component = {
      view() {
        return m('span', ['huh', '> >'])
      },
    }
    const out = render.sync(component)
    o(out).equals('<span>huh&gt; &gt;</span>')
  })
})

const classComponents = {
  es6: ES6ClassComponent,
  babel: BabelClassComponent,
  function: FunctionClassComponent,
}
for (const type in classComponents) {
  o.spec('component of ' + type + ' class', () => {
    const classComponent = classComponents[type]

    o('embedded', () => {
      o(render.sync(m('div', m(classComponent)))).equals(
        '<div><div>hellobar</div></div>'
      )
      o(render.sync(m('span', m(classComponent, { foo: 'foz' })))).equals(
        '<span><div>hellobarfoz</div></span>'
      )
    })

    o('as root', () => {
      o(render.sync(classComponent)).equals('<div>hellobar</div>')
      o(render.sync(classComponent, { foo: '-attr-foo' })).equals(
        '<div>hellobar-attr-foo</div>'
      )
    })
  })
}

o('`this` in component', () => {
  const oninit = o.spy()
  const myComponent = {
    oninit(vnode) {
      oninit()
      o(this).equals(vnode.state)(
        'vnode.state should be the context in `oninit`'
      )
      o(this.foo).equals(undefined)('this.foo should be undefined initially')
      this.foo = 5
      o(vnode.state.bar).equals(4)(
        'component properties should be copied to the state'
      )
    },
    view(vnode) {
      o(this).equals(vnode.state)(
        'vnode.state should be the context in the view'
      )
      return m('div', 'hello')
    },
    onremove(vnode) {
      o(this).equals(vnode.state)(
        'vnode.state should be the context in `onremove`'
      )
    },
    bar: 4,
  }

  o(render.sync([m(myComponent), m(myComponent)])).equals(
    '<div>hello</div><div>hello</div>'
  )

  o(oninit.callCount).equals(2)(
    'the component should have been initialized twice'
  )
})

o('lifecycle hooks as attributes on elements', () => {
  let initialized, removed
  render.sync(
    m('p', {
      oninit(vnode) {
        initialized = true
        o(this).equals(vnode.state)(
          'vnode.state should be the context in `oninit`'
        )
      },
      onremove(vnode) {
        removed = true
        o(this).equals(vnode.state)(
          'vnode.state should be the context in `onremove`'
        )
      },
    })
  )
  o(initialized).equals(true)('attr.oninit should run')
  o(removed).equals(true)('attr.onremove should run')
})

o('lifecycle hooks as attributes on components', () => {
  let attrInitialized = false
  let attrRemoved = false
  let tagInitialized = false
  let tagRemoved = false
  const myComponent = {
    oninit() {
      o(attrInitialized).equals(false)(
        '`attr.oninit()` should run after `tag.oninit()`'
      )
      tagInitialized = true
    },
    view() {
      return m('p', 'p')
    },
    onremove() {
      o(attrRemoved).equals(false)(
        '`attr.onremove()` should run after `tag.onremove()`'
      )
      tagRemoved = true
    },
  }
  o(
    render.sync(
      m(myComponent, {
        oninit(vnode) {
          o(this).equals(vnode.state)(
            'vnode.state should be the context in `attr.oninit`'
          )
          attrInitialized = true
          o(tagInitialized).equals(true)(
            '`attr.oninit()` should run after `tag.oninit()`'
          )
        },
        onremove(vnode) {
          o(this).equals(vnode.state)(
            'vnode.state should be the context in `attr.onremove`'
          )
          attrRemoved = true
          o(tagRemoved).equals(true)(
            '`attr.onremove()` should run after `tag.onremove()`'
          )
        },
      })
    )
  ).equals('<p>p</p>')
  o(tagInitialized).equals(true)('tag.oninit should be called')
  o(tagRemoved).equals(true)('tag.onremove should be called')
})

o('lifecycle hooks of class component', () => {
  let initialized, removed
  const classComponent = class {
    constructor(vnode) {
      this.vnode = vnode
    }
    oninit(vnode) {
      initialized = true
      o(this).equals(vnode.state)(
        'vnode.state should be the context in `oninit`'
      )
      o(this.vnode).equals(vnode)('vnode.state equals passed in constructor')
    }
    onremove(vnode) {
      removed = true
      o(this).equals(vnode.state)(
        'vnode.state should be the context in `onremove`'
      )
      o(this.vnode).equals(vnode)('vnode.state equals passed in constructor')
    }
    view(vnode) {
      o(this).equals(vnode.state)('vnode.state should be the context in `view`')
      o(this.vnode).equals(vnode)('vnode.state equals passed in constructor')
      return m('p', 'hello')
    }
  }
  o(render.sync(m(classComponent))).equals('<p>hello</p>')
  o(initialized).equals(true)('classComponent#oninit should run')
  o(removed).equals(true)('classComponent#onremove should run')
})

o(
  'onremove hooks should be called once the whole tree has been inititalized',
  () => {
    let initialized = 0
    const onremove = o.spy()
    function oninit() {
      initialized++
      o(onremove.callCount).equals(0)
    }
    const attrs = { oninit, onremove }
    const myComponent = {
      oninit,
      view() {
        return m('p', attrs, 'p')
      },
      onremove,
    }
    render.sync([m(myComponent, attrs), m(myComponent, attrs)])

    /*
  We just rendered two components, and each has three sets of hooks defined:
  one on the component object, one passed as component attributes, and one passed
  as attributes in the view. => 2 × 3 === 6
  */
    o(initialized).equals(6)('oninit should run six times')
    o(onremove.callCount).equals(6)('onremove should run six times')
  }
)

o('hooks are called top-down, depth-first on elements', () => {
  /*
   Suppose a tree with the following structure: two levels of depth,
   two components on the first depth level, the first one having a
   single child on level 2.

   +-- p
   | +-- a
   |
   +-- ul

  */
  let pInit = false
  let aInit = false
  let ulInit = false
  let pRemoved = false
  let aRemoved = false
  let ulRemoved = false
  const html = render.sync([
    m(
      'p',
      {
        oninit() {
          pInit = true
          o(aInit).equals(false)
          o(ulInit).equals(false)
        },
        onremove() {
          pRemoved = true
          o(aRemoved).equals(false)
          o(ulRemoved).equals(false)
        },
      },
      m(
        'a',
        {
          oninit() {
            aInit = true
            o(pInit).equals(true)
            o(ulInit).equals(false)
          },
          onremove() {
            aRemoved = true
            o(pRemoved).equals(true)
            o(ulRemoved).equals(false)
          },
        },
        'q'
      )
    ),
    m(
      'ul',
      {
        oninit() {
          ulInit = true
          o(pInit).equals(true)
          o(aInit).equals(true)
        },
        onremove() {
          ulRemoved = true
          o(pRemoved).equals(true)
          o(aRemoved).equals(true)
        },
      },
      'r'
    ),
  ])
  o(html).equals('<p><a>q</a></p><ul>r</ul>')
  o(pInit && ulInit && aInit && pRemoved && ulRemoved && aRemoved).equals(true)
})

o.spec('async', () => {
  o('render object components', async () => {
    const oninitSpy = o.spy()
    const viewSpy = o.spy()
    const myAsyncComponent = {
      oninit(vnode, waitFor) {
        this.foo = 'bar'
        oninitSpy()
        waitFor(
          Promise.resolve().then(() => {
            this.foo = 'baz'
          })
        )
      },
      view() {
        viewSpy()
        return m('div', this.foo)
      },
    }

    const p = render(myAsyncComponent)
    o(oninitSpy.callCount).equals(1)
    o(viewSpy.callCount).equals(0)
    const html = await p
    o(html).equals('<div>baz</div>')
    o(oninitSpy.callCount).equals(1)
    o(viewSpy.callCount).equals(1)
  })

  o('render nodes', async () => {
    const oninitSpy = o.spy()
    const html = await render(
      m(
        'span',
        {
          oninit(node, waitFor) {
            waitFor(
              new Promise(resolve => {
                oninitSpy()
                setTimeout(resolve, 10)
              })
            )
          },
        },
        'foo'
      )
    )
    o(html).equals('<span>foo</span>')
    o(oninitSpy.callCount).equals(1)
  })

  o('render object components sync', () => {
    const waitFors = []
    const myAsyncComponent = {
      oninit(vnode, waitFor) {
        waitFors.push(waitFor)
        this.foo = 'bar'
        return Promise.resolve().then(() => {
          this.foo = 'baz'
        })
      },
      view() {
        return m('div', this.foo)
      },
    }

    const html = render.sync(myAsyncComponent)
    o(waitFors).deepEquals([undefined])
    o(html).equals('<div>bar</div>')
  })

  o('render nodes sync', () => {
    const waitFors = []
    const oninitSpy = o.spy()
    const html = render.sync(
      m(
        'span',
        {
          oninit(node, waitFor) {
            waitFors.push(waitFor)
            return new Promise(resolve => {
              oninitSpy()
              setTimeout(resolve, 10)
            })
          },
        },
        'foo'
      )
    )
    o(waitFors).deepEquals([undefined])
    o(html).equals('<span>foo</span>')
    o(oninitSpy.callCount).equals(1)
  })
})

o('render closure components', () => {
  const closureComponent = () => {
    return {
      view() {
        return m('p', 'p')
      },
    }
  }
  o(render.sync(closureComponent())).equals('<p>p</p>')
})

o.run()
