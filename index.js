'use strict';

var omitAttrs = [
  'config',
  'onmousedown',
  'onmousemove',
  'onmouseover',
  'onclick',
  'onmouseout'
];

function isArray(thing) {
  return Object.prototype.toString.call(thing) === '[object Array]';
}

function camelToDash(str) {
  return str.replace(/\W+/g, '-')
            .replace(/([a-z\d])([A-Z])/g, '$1-$2');
}

function createAttrString(attrs) {
  if (!Object.keys(attrs).length) {
    return '';
  }

  return ' ' + Object.keys(attrs).map(function(name) {
    if (omitAttrs.indexOf(name) >= 0) {
      return '';
    }
    if (name === 'style') {
      var styles = attrs.style;
      return 'style="' + Object.keys(styles).map(function(property) {
        return [camelToDash(property).toLowerCase(), styles[property]].join(':');
      }).join(';') + '"';
    }
    return (name === 'className' ? 'class' : name) + '="' + attrs[name] + '"';
  }).join(' ');
}

function createTrustedContent(view) {
  return Object.keys(view).map(function(key) {
    if (key === '$trusted') {
      return '';
    }
    return view[key];
  }).join('');
}

function createChildrenContent(view) {
  if(!view.children || !view.children.length) {
    return '';
  }
  return render(view.children);
}

function render(view) {
  if (!view) {
    return '';
  }

  if (typeof view === 'string') {
    return view;
  }

  if (isArray(view)) {
    return view.map(render).join('');
  }

  if (view.$trusted) {
    return createTrustedContent(view);
  }
  return [
    '<', view.tag, createAttrString(view.attrs), '>',
    createChildrenContent(view),
    '</', view.tag, '>',
  ].join('');
}

module.exports = render;
