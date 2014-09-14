var assert = require('assert');
var lib = require('../lib');
var util = require('../../shared/util');
var Blob = lib.Blob;

var clone = util.clone;

function FakeApi(blob) {
    this.events = [];
    this.blob = blob;
}


FakeApi.prototype.emit = function (data) {
    if (data.value) {
        this.events.push([data.kind, data.path, clone(data.value)]);
    } else {
        this.events.push([data.kind, data.path]);
    }
    this.blob.onDelta(data);
};

(function() {
    var b = new Blob();
    b.api = new FakeApi(b);
    b.create("foo", 5);
    assert(b.store.foo === 5);
    assert(b.read("foo") === 5);

    b.create("bar.baz", 10);
    assert(b.store.bar.baz === 10);
})();

(function() {
    var b = new Blob();
    b.api = new FakeApi(b);
    b.create("foo", 5);
    assert(b.store.foo === 5);

    b.delete("foo");
    assert(b.store.foo === undefined);
})();

(function() {
    var b = new Blob();
    b.api = new FakeApi(b);
    b.create("foo", 5);
    assert(b.store.foo === 5);

    b.update("foo", 10);
    assert(b.store.foo === 10);

    b.delete("foo");
    assert(b.store.foo === undefined);
})();

(function() {
    var b = new Blob();
    b.api = new FakeApi(b);
    b.create("foo", 5);
    assert(b.store.foo === 5);

    b.update("foo", 10);
    assert(b.store.foo === 10);

    b.delete("foo");
    assert(b.store.foo === undefined);
})();

(function() {
    var b = new Blob();
    b.api = new FakeApi(b);
    b.create("foo", 5);
    assert(b.store.foo === 5);

    b.update("foo", 10);
    assert(b.store.foo === 10);

    b.delete("foo");
    assert(b.store.foo === undefined);

    assert.deepEqual(
        b.api.events,
        [['create', 'foo', 5],
        ['update', 'foo', 10],
        ['delete', 'foo']]);
})();


(function() {
    var b = new Blob();
    b.api = new FakeApi(b);
    b.create("foo", {x: 4, y: 5});
    assert(b.store.foo.x === 4);
    assert(b.store.foo.y === 5);

    b.update("foo.x", 10);
    assert(b.store.foo.x === 10);

    b.update("foo.y", 10);
    assert(b.store.foo.y === 10);

    b.delete("foo.x");
    assert(b.store.foo.x === undefined);

    b.delete("foo");
    assert(b.store.foo === undefined);

    assert.deepEqual(
        b.api.events,
        [
            ['create', 'foo', {x: 4, y: 5}],
            ['update', 'foo.x', 10],
            ['update', 'foo.y', 10],
            ['delete', 'foo.x'],
            ['delete', 'foo'],
        ]);
})();

(function() {
    var b = new Blob();
    b.api = new FakeApi(b);
    b.create("pos", {x: 4, y: 5});

    var bm = b.mirror("pos");
    assert(bm.x === 4);
    assert(bm.y === 5);

    bm.x = 20;
    assert(bm.x == 20);

    assert.deepEqual(
        b.api.events,
        [
            ['create', 'pos', {x: 4, y: 5}],
            ['update', 'pos.x', 20]
        ]);
})();

(function(){
    var b = new Blob();
    b.api = new FakeApi(b);
    b.keywords = ["z", "pos"];

    bm = b.mirror("");
    bm.pos = { x: 4, y: 5 };
    bm.pos.z = 20;

    assert(bm.pos.x === 4);
    assert(b.store.pos.x === 4);

    assert(bm.pos.z === 20);
    assert(b.store.pos.z === 20);

    assert.deepEqual(
        b.api.events,
        [
            ['create', 'pos', {x: 4, y: 5}],
            ['create', 'pos.z', 20]
        ]);
})();

(function(){
    var b = new Blob();
    b.api = new FakeApi(b);
    var newpath;
    b.on('create', function(kind, path, value){
        newpath = path;
    });
    b.create("foo", 5);
    assert(newpath == "foo");
})();

(function(){
    var b = new Blob();
    b.api = new FakeApi(b);
    b.create("foo", []);
    b.arrPush("foo", 2);

    assert(b.store.foo[0] === 2);
})();

(function(){
    var b = new Blob();
    b.api = new FakeApi(b);
    b.create("foo", []);
    var m = b.mirror("foo");
    m.push(2);

    assert(b.store.foo[0] === 2);
})();

(function(){
    var b = new Blob();
    b.api = new FakeApi(b);
    b.create("foo", {});
    var m = b.mirror("foo");
    m.__set("k", 20);

    assert(b.store.foo.k === 20);
})();

(function(){
    var b = new Blob().withKeywords('k', 'x');
    b.api = new FakeApi(b);
    b.create("foo", {});
    var m = b.mirror("foo");
    m.k = 20;
    m.x = 50;

    assert(b.store.foo.k === 20);
    assert(b.store.foo.x === 50);
})();

(function(){
    var b = new Blob();
    b.api = new FakeApi(b);
    b.create("foo", []);
    var m = b.mirror("foo");

    var found;
    b.on('arrPush', function(kind, path, value) {
        found = value;
    });

    m.push(5);

    assert(b.store.foo[0] === 5);
    assert(found === 5);

    m.push(6);

    assert(b.store.foo[1] === 6);
    assert(found === 6);
})();
