/* jshint node: true */
'use strict';

function ReadOnlyFacet(whitelist) {
  if (whitelist) {
    this.whitelist = whitelist;
  } else {
    this.whitelist = [];
  }
}

ReadOnlyFacet.prototype.onConnection = function (instance, socket) {
};

ReadOnlyFacet.prototype.onDisconnection = function (instance, socket) {
};

ReadOnlyFacet.prototype.onLoad = function (instance, socket) {
};

ReadOnlyFacet.prototype.onDelta = function (instance, socket, delta) {
  return this.whitelist.indexOf(delta.kind) < 0;
};

module.exports = ReadOnlyFacet;
