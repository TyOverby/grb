var assert = require('assert');
var CSBridge = require('../bridge.js');

(function(){
    var csb = new CSBridge();
    var blob = csb.blob;
    var server = csb.server;

    blob.create("foo", 5);

    setTimeout(function (){
        assert(blob.store.foo === 5);
        assert(server.data.foo === 5);
    }, 50);
})();
