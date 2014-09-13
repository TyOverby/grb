module.exports  = {
    'updateObject': function(blob, object, key, value) {
        if (blob !== null) {
            blob.api.updateObject(blob, object, key, value);
        }
    },
    'addObject': function(blob, object, key) {
        if (blob !== null) {
            blob.api.addObject(blob, object, key);
        }

    },
    'deleteObject': function(blob, object, key) {
        if (blob !== null) {
            blob.api.deleteObject(blob, object, key);
        }
    }
};
