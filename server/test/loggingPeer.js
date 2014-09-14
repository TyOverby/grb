var util = require('../../shared/util');
var clone = util.clone;

function LoggingPeer() {
    this.events = [];
}

LoggingPeer.prototype.emit = function(obj) {
    if (obj.value) {
        this.events.push([obj.kind, obj.path, clone(obj.value)]);
    } else {
        this.events.push([obj.kind, clone(obj.path)]);
    }
};

module.exports = LoggingPeer;
