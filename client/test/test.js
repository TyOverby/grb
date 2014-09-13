var assert = require('assert');
var lib = require('../lib');
var Blob = lib.Blob;

function FakeApi(blob) {
    this.events = [];
    this.blob = blob;
}

function clone(x){
    return JSON.parse(JSON.stringify(x));
}

FakeApi.prototype.create = function(path, value) {
    this.events.push(['create', path, clone(value)]);
    this.blob.create(path, value, true);
};

FakeApi.prototype.update = function(path, value) {
    this.events.push(['update', path, clone(value)]);
    this.blob.update(path, value, true);
};

FakeApi.prototype.delete = function(path, value) {
    this.events.push(['delete', clone(path)]);
    this.blob.delete(path, true);
};

FakeApi.prototype.arrPush = function(path, value) {
    this.events.push(['arrPush'], clone(path));
    this.blob.arrPush(path, value, true);
};

FakeApi.prototype.arrSplice = function(path, start, end) {
    this.events.push(['arrSplice'], clone(path));
    this.blob.arrSplice(path, start, end, true);
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
