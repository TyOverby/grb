var _ = require("lodash");

function Blob() {
    this.store = {};
    this.view = {};
    this.api = null;
    this.mirrors = {};
    this.keywords = [];
}

Blob.prototype.findParent = function(path, creating, removing) {
    var paths = path.split(".");
    var target = this.store;
    while (paths.length !== 1) {
        var next = paths.shift();
        if (target[next] === undefined) {
            if (creating) {
                target[next] = {};
            } else if (removing) {
                target = null;
                break;
            } else {
                return null;
            }
        }
        target = target[next];
    }
    return {'parent': target, 'last': paths[0]};
};

Blob.prototype.create = function(path, value, hide) {
    var p = this.findParent(path, true);
    p.parent[p.last] = value;

    var parentMirror = this.mirrors[p.parent];
    if (parentMirror !== undefined) {
        parentMirror.track(p.last);
    }

    if (this.api && !hide) {
        this.api.create(path, value);
    }
    return value;
};

Blob.prototype.read = function(path) {
    var p = this.findParent(path);
    return p.parent[p.last];
};

Blob.prototype.update = function(path, value) {
    this.create(path, value, true);
    if (this.api) {
        this.api.update(path, value);
    }
    return value;
};

Blob.prototype.delete = function(path) {
    var p = this.findParent(path, false, true);
    if (p.parent !== null) {
        delete p.parent[p.last];
    }
    delete this.mirrors[path];
    if (this.api) {
        this.api.delete(path);
    }
};

Blob.prototype.mirror = function(path) {
    var obj = this.read(path);
    if (_.isObject(obj)) {
        if (this.mirrors[path] === undefined) {
            this.mirrors[path] = new ObjectMirror(this, path);
        }
        return this.mirrors[path];
    } else if (_.isArray(obj)) {
        // TODO
    } else {
        return obj;
    }
};

function readonly(target, name, value) {
    Object.defineProperty(target, name, {value: value});
}

function ObjectMirror(blob, path) {
    readonly(this, "__blob", blob);
    readonly(this, "__path", path);
    var p = blob.findParent(path);
    readonly(this, "__focus", p.parent[p.last]);

    var that = this;
    _.forOwn(this.__focus, function(_, k){
        that.track(k);
    });
    _.forOwn(this.__blob.keywords, this.track.bind(that));
}

ObjectMirror.prototype.track = function(key) {
    var that = this;
    Object.defineProperty(this, key, {
        get: function() {
            return that.__blob.mirror(that.__path + "." + key);
        },
        set: function(newValue){
            if (that.__focus[key] !== undefined)  {
                that.__blob.update(that.__path + "." + key, newValue);
            } else {
                that.__blob.create(that.__path + "." + key, newValue);
            }
        },
        enumerable : true,
        configurable : true

    });
};

module.exports = {
    Blob: Blob
};
