(function(){
    var pathMap = {},
        task = [],
        currentPath = '';
    var Router = function(options) {
        if(options) this.map(options || []);
        setupListeners();
        if(ensureSlash()) {
            transitionTo(getHash());
        }
    };
    Router.prototype = {
        map: function (arr) {
            var curMap = pathMap;
            arr.map(function (item) {
                var paths = item.path.split('/');
                paths.map(function (path) {
                    if (path) {
                        curMap[path] = item;
                        curMap[path].children = {};
                        curMap = curMap[path].children;
                    }
                });
                curMap = pathMap;
            });
        },
        pushHash: function(path) {
            window.location.hash = path;
        },
        replaceHash: function(path) {
            replaceHash(path);
        },
        loadNext: function() {
            notify();
        }
    };
    function notify() {
        if(!task.length) return;
        var obj = task.shift();
        obj.load.apply(obj.content, [].concat(obj.parameters));
    }
    function setupListeners() {
        window.addEventListener('hashchange', function () {
            if (!ensureSlash()) {
                return;
            }
            task = [];
            transitionTo(getHash());
        });
    }
    function transitionTo(path) {
        path = path.replace(/\/?$/, '');
        replaceHash(path);
        if (path === currentPath) return;
        currentPath = path;
        var flag = path.split('/').every(function (path) {
            if(pathMap[path]) {
                task.push(pathMap[path]);
                return true;
            }
            else return false;
        });
        if(flag) notify();
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
