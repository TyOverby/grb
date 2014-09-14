/* jshint node: true */
'use strict';

var Server = require('socket.io');

var Instance = require('./Instance.js');

var facets = {
  MemoryFacet: require('./MemoryFacet.js'),
  MongoFacet: require('./MongoFacet.js'),
  BroadcastFacet: require('./BroadcastFacet.js')
};

var serve = function (server, path, namespace, id, facets) {
  var io = new Server(server);
  var instance = new Instance(namespace, id, facets);
  io.of(path).on('connection', function (socket) {
    instance._onConnection(socket);
    socket.on('disconnect', instance._onDisconnection.bind(instance));
    socket.on('load', instance._onLoad.bind(instance));
    socket.on('delta', instance._onDelta.bind(instance));
  });
};

exports.facets = facets;
exports.serve = serve;
