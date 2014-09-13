var _ = require('lodash');
var api = require('./api');

function BlobServer(server, room, onConnected, onFailure) {
    this.global = {};
    this.properties = [];
}

var special = ['__blob', '__parent', '__back', '__proxy', '__set'];

function Blob() {
    makeProxy(this, null, this);
    this.api = {};
}

Blob.prototype = {
    'addProperty': function(p) {
        this.properties.push(p);
    }
};

function makeProxy(blob, p, value) {
    if (value === undefined || value === null || value.__proxy) {
        return value;
    }

    value.__proxy = true;
    if (_.isObject(value)) {
        return makeObjectProxy(blob, p, value);
    } else if (_.isArray(value)) {
        return makeArrayProxy(blob, p, value);
    } else {
        return value;
    }
    return value;
}

function makeObjectProxy(blob, p, object) {
    function onSetter(key, value) {
        makeProxy(blob, object, value);
        if (value === undefined) {
            api.deleteObject(blob, object, key);
        } else if (object.__back[key] === undefined) {
            api.addObject(blob, object, key);
        } else {
            api.updateObject(blob, object, key, value);
        }
    }
    function getSet(key) {
        Object.defineProperty(object, key, {
            'configurable': false,
            'get': function() {
                return object.__back[key];
            },
            'set': function(newVal) {
                onSetter(key, newVal);
                object.__back[key] = newVal;
            }
        });
    }

    object.__blob  = blob;
    object.__parent = p;
    object.__back = {};
    object.__set = function (key, value) {
        if (object.__back[key] === undefined) {
            console.log('adding', key)
            api.addObject(blob, object, key);
            object.__back[key] = {};
        }
        getSet(key);
        object[key] = value;
        return value;
    };

    _.forOwn(object, function(v, k) {
        if (_.contains(special, k)) {
            return;
        }
        api.addObject(blob, object, k);
        var proxied_value =
            makeProxy(blob, object, v);
        api.updateObject(blob, object, k,
            proxied_value);
        object[k] = undefined;
        getSet(k);
        object[k] = v;
    });

    /*
    _.forOwn(blob.properties, function(k) {
        if (object['__back'][k] != undefined) {
            getSet(k);
        }
    });*/

    return object;
}

function makeArrayProxy(blob, p, value) {
    return value;
}

module.exports = {
    'makeProxy': makeProxy,
    'Blob': Blob
};
