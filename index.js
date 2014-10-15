'use strict';

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

  var attrString = Object.keys(view.attrs).map(function(name) {
    return (name === 'className' ? 'class' : name) + '="' + view.attrs[name] + '"';
  }).join(' ');
  attrString = attrString ? ' ' + attrString : '';

  return [
    '<', view.tag, attrString, '>',
    (view.children ? render(view.children) : ''),
    '</', view.tag, '>',
  ].join('');
}

module.exports = render;
