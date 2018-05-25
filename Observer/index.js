const Observer = (function () {
    let message = {};
    function register(types, listener) {
        eachType(types, function(listeners){
            if(listeners.indexOf(listener) === -1)listeners.push(listener);
        });
    }
    function fire(types) {
        let args = [].slice.call(arguments, 1);
        eachType(types, function (listeners) {
            for (let j = 0; j < listeners.length; j++) {
                let fn = listeners[j];
                if (fn.apply(this, args) === true) {
                    return true;
                }
                if (listeners[j] !== fn) j--;
            }
        });
    }
    function remove(types, listener) {
        eachType(types, function(listeners) {
            let index = listeners.indexOf(listener);
            if(index !== -1) listeners.splice(index, 1);
            else listeners.splice(0, listeners.length);
        });
    }
    function getListeners(type) {
        type = type.toLowerCase();
        return message[type] || (message[type] = []);
    }
    function eachType(types, fn) {
        types = types.replace(/(^\s+)|(\s+$)/g, '').split(/\s+/);
        for (let i = 0, type; type = types[i++];) {
            let listeners = getListeners(type);
            fn(listeners);
        }
    }
    return {
        register: register,
        fire: fire,
        remove: remove,
        getAll:() => {
            return message;
        }
    }
})();
