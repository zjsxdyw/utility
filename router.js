(function(){
    var pathMap = {};
    var Router = function(options) {
        if(options) this.map(options.map || []);
        this.setupListeners();
        ensureSlash();
    };
    Router.prototype = {
        map: function(arr) {
            arr.map(function(item){
                pathMap[item.path] = item;
            });
        },
        transitionTo: function(path) {
            var pathInfo = pathMap[path];
            if(!pathInfo) return;
            typeof pathInfo.load === 'function' && pathInfo.load();
        },
        setupListeners: function() {
            var self = this;
            window.addEventListener('hashchange', function () {
                if (!ensureSlash()) {
                    return;
                }
                self.transitionTo(getHash());
            });
        }
    };
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
    function pushHash(path) {
        window.location.hash = path;
    }
    function replaceHash(path) {
        var i = window.location.href.indexOf('#');
        window.location.replace(window.location.href.slice(0, i >= 0 ? i : 0) + '#' + path);
    }
    window.Router = Router;
    return Router;
})()
