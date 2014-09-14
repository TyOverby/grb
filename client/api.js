var blob_lib = require('./lib');
var Blob = blob_lib.Blob;

function ws_blob(server, ready){
    var socket = io.connect(server);

    var blob = new Blob();
    var api = new Api(blob, socket);
    blob.api = api;
    socket.emit('load', {});
    socket.on('load', function(data) {
        blob.setStore(data);
        ready(blob, blob.mirror());
    });
    socket.on('delta', function(data) {
        console.log("got message from server: ", data);
        api.onDelta(data);
    });
}

function Api(blob, outgoing) {
    this.blob = blob;
    this.outgoing = outgoing;
}

Api.prototype.emit = function(data) {
    this.outgoing.emit('delta', data);
    console.log('sent delta to server', data);
};

Api.prototype.onDelta = function(data) {
    this.blob.onDelta(data);
};

module.exports = {
    ws_blob: ws_blob
};
