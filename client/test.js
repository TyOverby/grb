var blib = require('./lib');
var assert = require('assert');
var makeProxy = blib.makeProxy;

var Blob = blib.Blob;

function FakeApi() {
    this.events = [];
}

FakeApi.prototype = {
    'updateObject': function(b,o,k,v) {
        this.events.push(["update", k, v]);
    },
    'addObject': function(b,o,k) {
        this.events.push(["add", k]);
    },
    'deleteObject': function(b,o,k) {
        this.events.push(["delete", k]);
    }
};

(function testBasicBlob() {
    var blob = new Blob();
    blob.api = new FakeApi();

    var pos = {x: 4, y: 5};
    blob.__set('pos', pos);
    assert(pos.__proxy);

    assert(pos.x == 4);
    assert(pos.y == 5);

    pos.x = 10;
    assert(pos.x == 10);
    assert(blob.pos.x == 10);

    blob.pos.y = 20;
    assert(pos.y == 20);
    assert(blob.pos.y == 20);

    console.log(blob.api.events);
    assert.deepEqual(
        blob.api.events,
        [
            ['add', 'pos'],
            ['add', 'x'],
            ['update', 'x', 4],
            ['add', 'y'],
            ['update', 'y', 5],
            ['update', 'x', 10],
            ['update', 'y', 20],
        ]);
})();

(function testProxyGen1() {
    var pos = {x: 4, y: 5};

    makeProxy(null, null, pos);
    console.log(pos);
    assert(pos.x == 4);
    assert(pos.y == 5);
})();

(function testProxyGen2() {
    var pos = {x: 4, y: 5};
    makeProxy(null, null, pos);

    pos.x = 20;
    pos.y = 30;

    assert(pos.x == 20);
    assert(pos.y == 30);
})();

(function testProxySet() {
    var pos = {x: 4, y: 5};
    makeProxy(null, null, pos);
    assert(pos.__proxy);

    pos.x = 20;
    pos.y = 30;
    pos.__set('z', 40);

    assert(pos.x == 20);
    assert(pos.y == 30);
    assert(pos.z == 40);

    pos.z = 50;
    assert(pos.z == 50);
})();


(function testProxySetDeep() {
    var pos = {x: 4, y: 5};
    makeProxy(null, null, pos);
    assert(pos.__proxy);

    pos.x = 20;
    pos.y = 30;
    pos.__set('z', {r: 40, w: 50});

    assert(pos.x == 20);
    assert(pos.y == 30);
    assert(pos.z.r == 40);
    assert(pos.z.w == 50);

    pos.z.r = 60;
    pos.z.w = 70;

    assert(pos.z.r == 60);
    assert(pos.z.w == 70);
})();

