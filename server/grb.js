/* jshint node: true */
'use strict';

var socketio = require('socket.io');
var MongoClient = require('mongodb').MongoClient;
var Q = require('q');

var IN_MEMORY = {
  connect: function () {
    return Q.fcall(function () {
      return {
        load: function () {
          return Q.fcall(function () {});
        },
        save: function() {
          return Q.fcall(function () {});
        }
      };
    });
  }
};
exports.IN_MEMORY = IN_MEMORY;

var MONGODB = {
  connect: function (namespace) {
    var deferred = Q.defer();
    MongoClient.connect('mongodb://localhost:27017/grb', function (err, db) {
      if (err) {
        deferred.reject(err);
      } else {
        var collection = db.collection(namespace);
        deferred.resolve({
          load: function (name) {
            var deferred = Q.defer();
            collection.findOne({ key: name }, function (err, item) {
              if (err) {
                deferred.reject(err);
              } else {
                deferred.resolve(item.value);
              }
            });
            return deferred.promise;
          },

          store: function (name, object) {
            var deferred = Q.defer();
            collection.save({ key: name, value: object }, function (err, result) {
              if (err) {
                deferred.reject(err);
              } else {
                deferred.resolve(result);
              }
            });
            return deferred.promise;
          }
        });
      }
    });
    return deferred.promise;
  }
};
exports.MONGODB = MONGODB;

var serve = function (connection, strategy, namespace, name) {
  var io = socketio.listen(connection);
  strategy.promise(namespace).then(function (connection) {
    connection.load(name).then(function (object) {
      io.on('connection', function (socket) {
        socket.on(namespace + '.' + name, function (burst) {
          for (var i = 0; i < burst.length; i++) {
            var ray = burst[i];
            var split = ray.path.split('.');
            for (var j = 0; j < split.length - 1; j++) {
              object = object[split[j]];
            }
            var property = split[split.length - 1];
            switch (ray.kind) {
              case 'create':
              case 'update':
                object[property] = ray.value;
                break;
              case 'delete':
                delete object[property];
                break;
            }
          }
          io.emit(namespace + '.' + name, burst);
          connection.save(name, object);
        });
      });
    });
  });
};
exports.serve = serve;
