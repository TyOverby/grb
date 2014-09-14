var util = require('grb-shared');

function Room(peer, data) {
    this.peer = peer;
    this.data = data || {};
}

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
    this.peer.emit(ray);
};

Room.prototype.create = function(path, value) {
    var p = util.traverse(this.data, path, true);
    if (p === null) return;
    p.parent[p.last] = value;
};

Room.prototype.update = function(path, value) {
    var p = util.traverse(this.data, path, true);
    if (p === null) return;
    p.parent[p.last] = value;
};

Room.prototype.delete = function(path, value) {
    var p = util.traverse(this.data, path, false, true);
    if (p === null) return;
    if (p.parent !== null) {
        delete p.parent[p.last];
    }
};

Room.prototype.arrPush = function(path, value) {
    var p = util.traverse(this.data, path);
    if (p === null) return;
    var arr = p.parent[p.last];
    arr.push(value);
};

module.exports = {
    Room: Room
};
