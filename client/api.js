var blob_lib = require('./lib');
var Blob = blob_lib.Blob;

function ws_blob(server, ready){
    var socket = io.connect(server);

    var oldemit = socket.emit;
    socket.emit = function(channel, message) {
        console.log("sending to server on channel \"" + channel + "\": " + message);
        oldemit(channel, message);
    };

    var blob = new Blob();
    var api = new Api(blob, socket);
    blob.api = api;
    socket.on('load', function(data) {
        blob.store = data;
        ready(blob);
    });
    socket.on('delta', function(data) {
        console.log("got message from server: ", data);
        api.onRecieve(data);
    });
}

/// [outgoing] must contain a function called `emit`
/// that takes a json value.
function Api(blob, outgoing) {
    this.blob = blob;
    this.outgoing = outgoing;
}

Api.prototype.onRecieve = function(data) {
    var kind = data.kind;
    var path = data.path;
    var value = data.value;
    switch (kind) {
        case 'update': {
            blob.update(path, value, true);
            break;
        }
        case 'create': {
            blob.create(path, value, true);
            break;
        }
        case 'delete': {
            blob.delete(path, true);
            break;
        }
        case 'arrPush': {
            blob.arrPush(path, value, true);
            break;
        }
        case 'arrSplice': {
            blob.arrSplice(path, value, true);
            break;
        }
        default: {
            console.log("unknown data kind: ", kind);
        }
    }
};

Api.prototype.create = function(path, value) {
    this.outgoing.emit('delta', {
        kind: 'create',
        path: path,
        value: value
    });
};

Api.prototype.update = function(path, value) {
    this.outgoing.emit('delta', {
        kind: 'update',
        path: path,
        value: value
    });
};

Api.prototype.delete = function(path, value) {
    this.outgoing.emit('delta', {
        kind: 'delete',
        path: path,
    });
};

Api.prototype.arrPush = function(path, value) {
    this.outgoing.emit('delta', {
        kind: 'arrPush',
        path: path,
        value: value
    });
};

Api.prototype.arrSplice = function(path, start, end) {
    this.outgoing.emit('delta', {
        kind: 'arrSplice',
        path: path,
        value: {start: start, end: end}
    });
};



module.exports = {
    ws_blob: ws_blob
};
