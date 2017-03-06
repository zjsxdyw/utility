var Observer = (function () {
    var message = {};
    function register(types, listener) {
        eachType(types, function(listeners){
            if(listeners.indexOf(listener) === -1)listeners.push(listener);
        });
    }
    function fire(types) {
        var args = [].slice.call(arguments, 1);
        eachType(types, function(listeners){
            for(var j = 0, n = listeners.length; j < n; j++) {
                if(listeners[j].apply(this, args) === true){
                    return true;
                }
            }
        });
    }
    function remove(types, listener) {
        eachType(types, function(listeners){
            var index = listeners.indexOf(listener);
            if(index !== -1) listeners.splice(index, 1);
        });
    }
    function getListeners(type) {
        return message[type] || (message[type] = []);
    }
    function eachType(types, fn) {
        types = types.replace(/(^\s+)|(\s+$)/g, '').split(/\s+/);
        for (var i = 0, type; type = types[i++];) {
            var listeners = getListeners(type);
            fn(listeners);
        }
    }
    return {
        register: register,
        fire: fire,
        remove: remove
    }
})();
