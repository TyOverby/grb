/* jshint node: true */
'use strict';

function BroadcastFacet() {
  this.connections = [];
}

BroadcastFacet.prototype.onConnection = function (instance, socket) {
  this.connections.push(socket);
};

BroadcastFacet.prototype.onDisconnection = function (instance, socket) {
  var index = this.connections.indexOf(socket);
  if (index >= 0) {
    this.connections.splice(index, 1);
  }
};

BroadcastFacet.prototype.onLoad = function (instance, socket) {
};

BroadcastFacet.prototype.onDelta = function (instance, socket, delta) {
  for (var i = 0; i < this.connections.length; i++) {
    this.connections[i].emit('delta', delta);
  }
};

module.exports = BroadcastFacet;
