/* jshint node: true */
'use strict';

var Q = require('q');
var socketio = require('socket.io');
var MongoClient = require('mongodb').MongoClient;

var IN_MEMORY = {
  connect: function () {
    return Q.fcall(function () {
      return {
        load: function () {
          return Q.fcall(function () {});
        },
        update: function () {
          return Q.fcall(function () {});
        }
      };
    });
  }
};
exports.IN_MEMORY = 0;

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

          update: function (name, updates) {
            var deferred = Q.defer();
            collection.update({ key: name }, updates, { upsert: true }, function (err, result) {
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
exports.MONGODB = 1;

var serve = function (connection, strategy, namespace, name) {
  var io = socketio.listen(connection);
  var promise;
  switch (strategy) {
    case exports.IN_MEMORY:
      promise = IN_MEMORY.connect(namespace);
      break;
    case exports.MONGODB:
      promise = MONGODB.connect(namespace);
      break;
  }
  promise.then(function (connection) {
    connection.load(name).then(function (object) {
      io.on('connection', function (socket) {
        socket.emit('load', object);
        socket.on('update', function (burst) {
          var updates = processBurst(connection, object, burst);
          socket.emit('update', burst);
          connection.update(name, updates);
        });
      });
    });
  });
};
exports.serve = serve;

var processBurst = function (connection, object, burst) {
  var set = {};
  var unset = {};
  var push = {};
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
        set[ray.path] = ray.value;
        break;
      case 'delete':
        delete object[property];
        unset[ray.path] = "";
        break;
      case 'arrPush':
        object[property].push(ray.value);
        if (!push[ray.path]) {
          push[ray.path] = [];
        }
        push[ray.path].push(ray.value);
    }
  }

  var updates = { $set: set, $unset: unset };
  for (var path in push) {
    updates.$push.path = { $each: push[path] };
  }
  return updates;
};
