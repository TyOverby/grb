/* jshint node: true */
'use strict';

var socketio = require('socket.io');

var Instance = require('./Instance.js');

var facets = {
  MemoryFacet: require('./MemoryFacet.js'),
  MongoFacet: require('./MongoFacet.js'),
  BroadcastFacet: require('./BroadcastFacet.js')
};

var serve = function (path, namespace, id, facets) {
  var io = socketio();
  var instance = new Instance(namespace, id, facets);
  io.of(path).use(function (socket) {
    socket.on('connection', instance._onConnection);
    socket.on('disconnect', instance._onDisconnection);
    socket.on('load', instance._onLoad);
    socket.on('delta', instance._onDelta);
  });
};

exports.facets = facets;
exports.serve = serve;
