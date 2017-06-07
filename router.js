(function () {
    var pathMap = {},
        curMap,
        task = [],
        currentPath = '';
    var notEmpty = function (x) { return !!x };
    var isFunction = function (fn) {
        return Object.prototype.toString.call(fn) === '[object Function]';
    }
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
                var paths = item.path.split('/');
                paths.filter(notEmpty).map(function (path, i, arr) {
                    if (arr.length - 1 === i) curMap[path] = item;
                    else if (!curMap[path]) curMap[path] = {};
                    if (!isFunction(curMap[path].load)) curMap[path].load = notify;
                    if (!curMap[path].children) curMap[path].children = {};
                    curMap[path].next = notify;
                    curMap = curMap[path].children;
                });
                curMap = pathMap;
            });
        },
        pushHash: function (path) {
            window.location.hash = path;
        },
        replaceHash: function (path) {
            replaceHash(path);
        },
        next: notify
    };
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
        if (path !== '/') path = path.replace(/\/\//g, '/').replace(/\/?$/, '');
        replaceHash(path);
        if (path === currentPath) return;
        var paths = path.split('/').filter(notEmpty),
            oldPaths = currentPath.split('/').filter(notEmpty),
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
