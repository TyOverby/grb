function normalizePath(path) {
    return path.split(".")
               .map(function(c) { return c.trim(); })
               .filter(function(c) { return c.length > 0; })
               .join(".");
}

function traverse(object, path, creating, removing) {
    path = normalizePath(path);
    if (path === "") {
        return {'parent': {'obj': object}, last: 'obj'};
    }
    var paths = path.split(".");
    var target = object;
    while (paths.length !== 1) {
        var next = paths.shift();
        if (target[next] === undefined) {
            if (creating) {
                target[next] = {};
            } else if (removing) {
                target = null;
                return null;
            } else {
                return null;
            }
        }
        target = target[next];
    }
    return {'parent': target, 'last': paths[0]};
}

function clone(x){
    return JSON.parse(JSON.stringify(x));
}

module.exports = {
    normalizePath: normalizePath,
    traverse: traverse,
    clone: clone
};


