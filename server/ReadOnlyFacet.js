/* jshint node: true */
'use strict';

function ReadOnlyFacet() {
}

ReadOnlyFacet.prototype.onConnection = function (instance, socket) {
};

ReadOnlyFacet.prototype.onDisconnection = function (instance, socket) {
};

ReadOnlyFacet.prototype.onLoad = function (instance, socket) {
};

ReadOnlyFacet.prototype.onDelta = function (instance, socket, delta) {
  return true;
};

module.exports = ReadOnlyFacet;
