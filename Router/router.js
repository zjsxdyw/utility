(function () {
    var pathMap = {},
        curMap,
        task = [],
        currentPath = '';
    var removeSlash = function (str) {
        return str.replace(/\/\/*/g, '/').replace(/\/?$/, '')
    };
    var isFunction = function (fn) {
        return Object.prototype.toString.call(fn) === '[object Function]';
    };
    var Router = function (options) {
        if (Array.isArray(options)) this.map(options);
        setupListeners();
        if (ensureSlash()) {
            transitionTo(getHash());
        }
    };
    Router.prototype = {
        map: function (arr) {
            var curMap = pathMap;
            arr.map(function (item) {
                var paths = removeSlash(item.path).replace(/^\//, '').split('/');
                paths.map(function (path, i, arr) {
                    if (arr.length - 1 === i) curMap[path] = item;
                    else if (!curMap[path]) curMap[path] = {};
                    if (!curMap[path].children) curMap[path].children = {};
                    if (!isFunction(curMap[path].load)) curMap[path].load = notify;
                    curMap = curMap[path].children;
                });
                curMap = pathMap;
            });
        },
        remove: function (path) {
            var curMap = pathMap,
                paths = removeSlash(path).replace(/^\//, '').split('/');
            for (var i = 0, len = paths.length; i < len; i++) {
                if (len - 1 === i) delete curMap[path];
                else if (!curMap[path]) break;
                curMap = curMap[path].children;
            }
        },
        pushHash: function (path) {
            window.location.hash = path;
        },
        replaceHash: function (path) {
            replaceHash(path);
        }
    };
    Router.hasNext = function(){ return task.length > 0; };
    Router.next = notify;
    function notify() {
        if (!task.length) return;
        var path = task.shift(),
            obj = curMap[path];
        if (obj) {
            curMap = obj.children;
            obj.load.apply(obj, [].concat(obj.parameters));
        }
    }
    function setupListeners() {
        window.addEventListener('hashchange', function () {
            if (!ensureSlash()) return;
            task = [];
            transitionTo(getHash());
        });
    }
    function transitionTo(path) {
        if (path !== '/') path = removeSlash(path);
        replaceHash(path);
        if (path === currentPath) return;
        var paths = path.replace(/^\//, '').split('/'),
            oldPaths = currentPath.replace(/^\//, '').split('/'),
            isCompared = true;
        curMap = pathMap;
        currentPath = path;
        for (var i = 0, m = paths.length, n = oldPaths.length; i < m; i++) {
            if (isCompared && paths[i] === oldPaths[i]) {
                if (i === m - 1) {
                    task.push(paths[i]);
                    break;
                }
                curMap = curMap[paths[i]].children;
            } else {
                isCompared = false;
                task.push(paths[i]);
            }
        }
        notify();
    }
    function ensureSlash() {
        var path = getHash();
        if (path.charAt(0) === '/') {
            return true;
        }
        replaceHash('/' + path);
        return false;
    }
    function getHash() {
        var href = window.location.href;
        var index = href.indexOf('#');
        return index === -1 ? '' : href.slice(index + 1);
    }
    function replaceHash(path) {
        var i = window.location.href.indexOf('#');
        window.location.replace(window.location.href.slice(0, i >= 0 ? i : 0) + '#' + path);
    }
    window.Router = Router;
    return Router;
})();
