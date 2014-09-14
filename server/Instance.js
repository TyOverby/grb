/* jshint node: true */
'use strict';

var Q = require('q');

function Instance(namespace, id, facets) {
  this.namespace = namespace;
  this.id = id;
  this.facets = facets;
  this.object = {};
}

Instance.prototype._onConnection = function (socket) {
  for (var i = 0; i < this.facets.length; i++) {
    this.facets[i].onConnection(this, socket);
  }
};

Instance.prototype._onDisconnection = function (socket) {
  for (var i = 0; i < this.facets.length; i++) {
    this.facets[i].onDisconnection(this, socket);
  }
};

Instance.prototype._onLoad = function (socket) {
  if (this.facets.length > 0) {
    this._onLoadHelper(socket, 0);
  }
};

Instance.prototype._onLoadHelper = function (socket, index) {
  var result = this.facets[index].onLoad(this, socket);
  if (result) {
    if (Q.isPromise(result)) {
      result.then(function (object) {
        if (object) {
          this.object = object;
        } else if (index + 1 < this.facets.length) {
          this._onLoadHelper(socket, index + 1);
        }
      }.bind(this));
    } else {
      this.object = result;
    }
  } else {
    this._onLoadHelper(socket, index + 1);
  }
};

Instance.prototype._onDelta = function (socket, delta) {
  for (var i = 0; i < this.facets.length; i++) {
    var result = this.facets[i].onDelta(this, socket, delta);
    if (result) {
      break;
    }
  }
};

module.exports = Instance;
