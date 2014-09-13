var blob_lib = require('./lib');
var Blob = blob_lib.Blob;

function ws_blob(server, ready){
    var socket = io.connect(server);
    var blob = new Blob();
    socket.on('load', function(data) {
        blob.store = data;
        ready(blob);
    });
    socket.on('update', function(data) {
        var kind = data.kind;
        var path = data.path;
        var value = data.value;
        switch (data.kind) {
            case 'udpate': {
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
            default: {
                console.log("unknown data kind: ", kind);
            }
        }
    });

    blob.api = {
        'create': function(p, v) {
            socket.emit('update', {
                kind: 'create',
                path: p,
                value: v
            });
        },
        'update': function(p, v) {
            socket.emit('update', {
                kind: 'update',
                path: p,
                value: v
            });
        },
        'delete': function(p, v) {
            socket.emit('update', {
                kind: 'delete',
                path: p,
                value: v
            });
        },
        'arrPush': function(p, v) {
            socket.emit('update', {
                kind: 'arrPush',
                path: p,
                value: v
            });
        }
    };
}

function Api() {

}


module.exports = {
    ws_blob: ws_blob
};
