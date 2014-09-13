var assert = require('assert');
var common = require('../common');
var LoggingPeer = require('./loggingPeer');
var Room = common.Room;

(function(){
    var log = new LoggingPeer();
    var room = new Room(log);

    room.processRay({'kind': 'create', 'path': 'foo', value: 5});
    assert.deepEqual(
        log.events,
        [['create', 'foo', 5]]);

    assert.deepEqual(
        room.data,
        {'foo': 5});
})();

(function(){
    var log = new LoggingPeer();
    var room = new Room(log);

    room.processRay({kind: 'create', path: 'pos', value: {x:4, y:5}});

    assert.deepEqual(
        log.events,
        [['create', 'pos', {x:4, y:5}]]);

    assert.deepEqual(
        room.data,
        {'pos': {x:4, y:5}});

    room.processRay({kind: 'update', path: 'pos.x', value: 20});

    assert.deepEqual(
        log.events,
        [ ['create', 'pos', {x:4, y:5}],
          ['update', 'pos.x', 20] ]);

    assert.deepEqual(
        room.data,
        {'pos': {x:20, y:5}});

})();

(function(){
    var log = new LoggingPeer();
    var room = new Room(log);

    room.processRay({kind: 'create', path: 'a', value: []});
    assert.deepEqual(
        room.data,
        {a: []});
    assert.deepEqual(
        log.events,
        [['create', 'a', []]]);

    room.processRay({kind: 'arrPush', path: 'a', value: 5});
    assert.deepEqual(
        room.data,
        {a: [5]});
    assert.deepEqual(
        log.events,
        [['create', 'a', []], ['arrPush', 'a', 5]]);
})();

(function(){
    var log = new LoggingPeer();
    var room = new Room(log);

    room.processRay({kind: 'create', path: 'pos', value: {x: 4, y:5}});
    assert.deepEqual(
        room.data,
        {pos: {x: 4, y:5}});
    assert.deepEqual(
        log.events,
        [['create', 'pos', {x:4, y:5}]]);

    room.processRay({kind: 'delete', path: 'pos.x'});
    assert.deepEqual(
        room.data,
        {pos: {y: 5}});
    assert.deepEqual(
        log.events,
        [['create', 'pos', {x:4, y:5}],
         ['delete', 'pos.x']]);
})();
