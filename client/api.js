var blob_lib = require('./lib');
var Blob = blob_lib.Blob;

function ws_blob(server, ready){
    var socket = io.connect(server);

    var blob = new Blob();
    var api = new Api(blob, socket);
    blob.api = api;
    socket.on('load', function(data) {
        blob.store = data;
        ready(blob);
    });
    socket.on('delta', function(data) {
        console.log("got message from server: ", data);
        api.onReceive(data);
    });
}

function Api(blob, outgoing) {
    this.blob = blob;
    this.outgoing = outgoing;
}

Api.prototype.emit = function(data) {
    this.outgoing.emit('delta', data);
};

Api.prototype.onRecieve = function(data) {
    this.blob.onRecieve(data);
};

module.exports = {
    ws_blob: ws_blob
};
