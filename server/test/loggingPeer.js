var util = require('../../shared/util');
var clone = util.clone;

function LoggingPeer() {
    this.events = [];
}

LoggingPeer.prototype.arrPush = function(path, value) {
    this.events.push(['arrPush', path, clone(value)]);
};

LoggingPeer.prototype.delete = function(path, value) {
    this.events.push(['delete', path]);
};

LoggingPeer.prototype.update = function(path, value) {
    this.events.push(['update', path, clone(value)]);
};

LoggingPeer.prototype.create = function(path, value) {
    this.events.push(['create', path, clone(value)]);
};

LoggingPeer.prototype.arrPush = function(path, value) {
    this.events.push(['arrPush', path, clone(value)]);
};

module.exports = LoggingPeer;
