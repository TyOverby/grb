/* jshint node: true */
'use strict';

var Q = require('q');
var MongoClient = require('mongodb').MongoClient;

function MongoFacet(url) {
  this.url = url;
  this.connectionCount = 0;
}

MongoFacet.prototype.onConnection = function (instance, socket) {
  this.connectionCount += 1;
};

MongoFacet.prototype.onDisconnection = function (instance, socket) {
  this.connectionCount -= 1;
  if (this.connectionCount === 0) {
    // bind this in case it changes later
    var object = instance.object;
    MongoClient.connect(this.url, function (err, db) {
      if (!err) {
        var collection = db.collection(instance.namespace);
        collection.update({ key: instance.id }, { key: instance.id, value: object }, { upsert: true }, function (err, result) {
          db.close();
        });
      }
    });
  }
};

MongoFacet.prototype.onLoad = function (instance, socket) {
  var deferred = Q.defer();
  MongoClient.connect(this.url, function (err, db) {
    if (err) {
      deferred.reject(err);
    } else {
      var collection = db.collection(instance.namespace);
      collection.findOne({ key: instance.id }, function(err, result) {
        if (err) {
          deferred.reject(err);
        } else {
          if (result) {
            deferred.resolve(result.value);
          } else {
            deferred.resolve(null);
          }
        }
        db.close();
      });
    }
  });
  return deferred.promise;
};

MongoFacet.prototype.onDelta = function (instance, socket, delta) {
};

module.exports = MongoFacet;
