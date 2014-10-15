'use strict';

var omitAttrs = [
  'config',
  'onmousedown',
  'onmousemove',
  'onmouseover',
  'onclick',
];

function isArray(thing) {
  return Object.prototype.toString.call(thing) === '[object Array]';
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
    return Object.keys(view).map(function(key) {
      if (key === '$trusted') {
        return '';
      }
      return view[key];
    }).join('');
  }

  var attrString = '';
  if (view.attrs) {
    attrString = Object.keys(view.attrs).map(function(name) {
      if (omitAttrs.indexOf(name) >= 0) {
        return '';
      }
      return (name === 'className' ? 'class' : name) + '="' + view.attrs[name] + '"';
    }).join(' ');
    attrString = attrString ? ' ' + attrString : '';
  }

  return [
    '<', view.tag, attrString, '>',
    (view.children ? render(view.children) : ''),
    '</', view.tag, '>',
  ].join('');
}

module.exports = render;
