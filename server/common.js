var util = require('../shared/util');

function Room(peer, data) {
    this.peer = peer;
    this.data = data || {};
}

Room.prototype.processBurst = function(burst) {
    for (var k in burst) {
        var ray = burst[k];
        this.processRay(ray);
    }
};

Room.prototype.processRay = function(ray) {
    var kind = ray.kind;
    var path = ray.path;
    var value = ray.value;
    switch (kind) {
        case 'create': {
            this.create(path, value);
            break;
        }
        case 'update': {
            this.update(path, value);
            break;
        }
        case 'delete': {
            this.delete(path);
            break;
        }
        case 'arrPush': {
            this.arrPush(path, value);
            break;
        }
    }
};

Room.prototype.create = function(path, value) {
    var p = util.traverse(this.data, path, true);
    if (p === null) return;
    p.parent[p.last] = value;
    if (this.peer) {
        this.peer.create(path, value);
    }
};

Room.prototype.update = function(path, value) {
    var p = util.traverse(this.data, path, true);
    if (p === null) return;
    p.parent[p.last] = value;
    if (this.peer) {
        this.peer.update(path, value);
    }
};

Room.prototype.delete = function(path, value) {
    var p = util.traverse(this.data, path, false, true);
    if (p === null) return;
    if (p.parent !== null) {
        delete p.parent[p.last];
    }
    if (this.peer) {
        this.peer.delete(path, value);
    }
};

Room.prototype.arrPush = function(path, value) {
    var p = util.traverse(this.data, path);
    if (p === null) return;
    var arr = p.parent[p.last];
    arr.push(value);
    if (this.peer) {
        this.peer.arrPush(path, value);
    }
};

module.exports = {
    Room: Room
};
