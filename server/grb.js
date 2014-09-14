/* jshint node: true */
'use strict';

var Instance = require('./Instance.js');

var facets = {
  MemoryFacet: require('./MemoryFacet.js'),
  MongoFacet: require('./MongoFacet.js'),
  BroadcastFacet: require('./BroadcastFacet.js')
};

var serve = function (io, path, namespace, id, facets) {
  var instance = new Instance(namespace, id, facets);
  io.of(path).on('connection', function (socket) {
    instance._onConnection(socket);
    socket.on('disconnect', function () {
      instance._onDisconnection(socket);
    });
    socket.on('load', function () {
      instance._onLoad(socket);
    });
    socket.on('delta', function (delta) {
      instance._onDelta(socket, delta);
    });
  });
};

exports.facets = facets;
exports.serve = serve;
