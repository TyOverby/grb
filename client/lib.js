var _ = require("lodash");
var util = require("grb-shared");

function Blob() {
    this.store = {};
    this.view = {};
    this.api = null;
    this.mirrors = {};
    this.keywords = [];
    this.listeners = {
        'update': {},
        'create': {},
        'delete': {},
        'all':    {},
    };
    this.listenid = 0;
}

var normalizePath = util.normalizePath;

Blob.prototype.onDelta = function(data) {
    var kind = data.kind;
    var path = data.path;
    var value = data.value;
    switch (kind) {
        case 'update': {
            this.update(path, value, true);
            break;
        }
        case 'create': {
            this.create(path, value, true);
            break;
        }
        case 'delete': {
            this.delete(path, true);
            break;
        }
        case 'arrPush': {
            this.arrPush(path, value, true);
            break;
        }
        case 'arrSplice': {
            this.arrSplice(path, value, true);
            break;
        }
        default: {
            console.log("unknown data kind: ", kind);
        }
    }
};


Blob.prototype.on = function(lkind, callback) {
    this.listenid += 1;
    var id = this.listenid;
    this.listeners[lkind][id] = callback;
    var that = this;
    return {
        cancel: function() {
            delete that.listeners[lkind][id];
        }
    };
};

Blob.prototype._triggerUpdate = function(kind, path, data) {
    function runAll(table) {
        _.forOwn(table, function(v) {
            v(kind, path, data);
        });
    }
    runAll(this.listeners[kind]);
    runAll(this.listeners.all);
};

Blob.prototype.findParent = function(path, creating, removing) {
    return util.traverse(this.store, path, creating, removing);
};

Blob.prototype.create = function(path, value, force, hide) {
    path = normalizePath(path);
    if (force) {
        var p = this.findParent(path, true);
        p.parent[p.last] = value;

        var parentMirror = this.mirrors[p.parent];
        if (parentMirror !== undefined) {
            parentMirror.track(p.last);
        }
    }

    if (this.api && !hide && !force) {
        this.api.emit({
            kind: 'create',
            path: path,
            value: value
        });
    }
    if (!hide) {
        this._triggerUpdate('create', path, value);
    }
    return value;
};

Blob.prototype.read = function(path) {
    path = normalizePath(path);
    var p = this.findParent(path);
    return p.parent[p.last];
};

Blob.prototype.update = function(path, value, force) {
    path = normalizePath(path);
    this.create(path, value, force, true);
    if (this.api && !force) {
        this.api.emit({
            kind: 'update',
            path: path,
            value: value
        });
    }
    this._triggerUpdate('update', path, value);
    return value;
};

Blob.prototype.delete = function(path, force) {
    path = normalizePath(path);

    if (force) {
        var p = this.findParent(path, false, true);
        if (p.parent !== null) {
            delete p.parent[p.last];
        }
    }

    if (this.api && !force) {
        this.api.emit({
            kind: 'delete',
            path: path
        });
    }
    this._triggerUpdate('delete', path);
};

Blob.prototype.arrPush = function(path, value, force) {
    path = normalizePath(path);
    if (force) {
        var p = this.findParent(path);
        var arr = p.parent[p.last];
        arr.push(value);
    }

    if (this.api && !force) {
        this.api.emit({
            kind: 'arrPush',
            path: path,
            value: value
        });
    }
    this._triggerUpdate('arrPush', path, value);
};

Blob.prototype.arrSplice = function(path, start, end, force) {
    path = normalizePath(path);
    if (force) {
        var p = this.findParent(path);
        var arr = p.parent[p.last];
        arr.splice(start, end);
    }

    var value = { start: start, end: end };
    if (this.api && !force) {
        this.outgoing.emit({
            kind: 'arrSplice',
            path: path,
            value: {start: start, end: end}
        });
    }
    this._triggerUpdate('arrSplice', path, value);
};

Blob.prototype.mirror = function(path) {
    var obj;
    if (!path) {
        path = "";
        obj = this.store;
    } else {
        path = normalizePath(path);
        obj = this.read(path);
    }

    if (_.isArray(obj)) {
        if (this.mirrors[path] === undefined) {
            this.mirrors[path] = new ArrayMirror(this, path);
        }
        return this.mirrors[path];
    } else if (_.isObject(obj)) {
        if (this.mirrors[path] === undefined) {
            this.mirrors[path] = new ObjectMirror(this, path);
        }
        return this.mirrors[path];
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
        that.__track(k);
    });
    _.forOwn(this.__blob.keywords, this.__track.bind(this));
}

ObjectMirror.prototype.__track = function(key) {
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

function ArrayMirror(blob, path) {
    ObjectMirror.call(this, blob, path);
}

ArrayMirror.prototype.__track = ObjectMirror.prototype.__track;

ArrayMirror.prototype.push = function(value) {
    this.__blob.arrPush(this.__path, value);
};

ArrayMirror.prototype.splice = function(start, end) {
    this.__blob.arrSplice(this.__path, start, end);
};

module.exports = {
    Blob: Blob
};
