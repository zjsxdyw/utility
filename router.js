(function(){
    var pathMap = {};
    var Router = function(options) {
        if(options) this.map(options || []);
        this.currentPath = '';
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
        }
    };
    function setupListeners() {
        var self = this;
        window.addEventListener('hashchange', function () {
            if (!ensureSlash()) {
                return;
            }
            transitionTo(getHash());
        });
    }
    function transitionTo(path) {
        path = path.replace(/\/?$/, '');
        replaceHash(path);
        if (path === this.currentPath) return;
        this.currentPath = path;
        path.split('/').map(function (path) {
            var pathInfo = pathMap[path];
        })
        if(!pathInfo || (path === this.currentPath) || (typeof pathInfo.load !== 'function')) return;
        pathInfo.load.apply(pathInfo.content, [].concat(pathInfo.parameters));
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
