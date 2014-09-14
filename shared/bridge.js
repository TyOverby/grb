var clientBlob = require('../client/lib').Blob;
var Room = require("../server/common").Room;
var util = require('./util');

function FakeClientApi(blob, server) {
    this.blob = blob;
    this.serverApi = server;
    this.emit = function(x) {
        var cobj = util.clone(x);
        setTimeout(function() {
            this.serverApi.processRay(cobj);
        }.bind(this), 0);
    }.bind(this);
}

function FakeServerApi(client) {
    this.client = client;
    this.emit = function(obj) {
        var cobj = util.clone(obj);
        setTimeout(function(){
            this.client.onRecieve(cobj);
        }.bind(this), 0);
    }.bind(this);
}

function ClientServerBridge() {
    this.blob = new clientBlob();
    this.server = new Room();

    this.clientApi = new FakeClientApi(this.clientBlob, this.server);
    this.blob.api = this.clientApi;

    this.serverApi = new FakeServerApi();
    this.serverApi.client = this.blob;
    this.server.peer = this.serverApi;
}

module.exports = ClientServerBridge;
