/* jshint node: true */
'use strict';

var util = require('grb-shared');

function MemoryFacet() {
  this.data = {};
}

MemoryFacet.prototype.onConnection = function (instance, socket) {
};

MemoryFacet.prototype.onDisconnection = function (instance, socket) {
};

MemoryFacet.prototype.onLoad = function (instance, socket) {
  var namespaceObj;
  if (!this.data[instance.namespace]) {
    this.data[instance.namespace] = {};
  }
  namespaceObj = this.data[instance.namespace];

  var idObj;
  if (!namespaceObj[instance.id]) {
    namespaceObj[instance.id] = {};
  }
  idObj = namespaceObj[instance.id];

  return idObj;
};

MemoryFacet.prototype.onDelta = function (instance, socket, delta) {
  var p;
  var arr;
  switch (delta.kind) {
    case 'create':
    case 'update': {
      p = util.traverse(instance.object, delta.path, true);
      if (p === null) return;
      p.parent[p.last] = delta.value;
      break;
    }
    case 'delete': {
      p = util.traverse(instance.object, delta.path, false, true);
      if (p === null) return;
      if (p.parent !== null) {
          delete p.parent[p.last];
      }
      break;
    }
    case 'arrPush': {
      p = util.traverse(instance.object, delta.path);
      if (p === null) return;
      arr = p.parent[p.last];
      arr.push(delta.value);
      break;
    }
    case 'arrSplice': {
      p = util.traverse(instance.object, delta.path);
      if (p === null) return;
      arr = p.parent[p.last];
      arr.splice(delta.start, delta.end);
      break;
    }
  }
};

module.exports = MemoryFacet;
