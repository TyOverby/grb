function Room(peer) {
    this.peer = peer;
}

Room.prototype.processBurst = function(burst) {
    for (var k in burst) {
        var ray = burst[k];
        this.processRay(ray);
    }
};

Room.prototype.processRay = function(ray) {

};
