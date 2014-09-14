var CSBridge = require('../bridge.js');

(function(){
    var csb = new CSBridge();
    var cblob = csb.blob;

    cblob.create("foo", 5);

    setTimeout(function (){
        //console.log(csb);
    }, 50);
})();
