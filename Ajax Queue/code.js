function queue(num) {
    const PENDING = 'pending';
    const PREPARATION = 'preparation';
    const DONE = 'done';
    let queue = [],
        paused = false,
        _ajax = $.ajax;
    num = num || 1;
    
    function next() {
        if (paused) return;
        let i = 0;
        while(i < num && i < queue.length) {
            switch(queue[i].state) {
                case DONE:
                    queue.splice(i, 1);
                    break;
                case PREPARATION:
                    send(queue[i]);
                case PENDING:
                    i++;
                    break;
            }
        }
    }

    function send(obj) {
        obj.state = PENDING;
        obj.ajax = _ajax(obj.options).then(callback(obj, 'resolve')).fail(callback(obj, 'reject'));
    }

    function setCallback(deferred, options) {
        deferred.then(options.success).fail(options.error);
        delete options.success;
        delete options.error;
    }

    function callback(obj, action) {
        return function() {
            obj.state = DONE;
            obj.deferred[action].apply(obj.deferred, arguments);
            next();
        }
    }

    function ajax(url, options) {
        let deferred = $.Deferred();

        if (typeof url === "object") {
            options = url;
            url = undefined;
        } else {
            options = options || {};
            options.url = url;
        }

        setCallback(deferred, options);

        queue.push({
            options: options,
            deferred: deferred,
            state: PREPARATION
        });

        next();

        return deferred;
    }

    function pause() {
        paused = true;
    }

    function goon() {
        paused = false;
        next();
    }

    function stop() {
        let arr = queue.filter(function(obj) {
            return obj.state === PENDING;
        });
        queue = [];
        arr.forEach(function(obj) {
            obj.ajax.abort();
        });
    }

    return {
        ajax,
        stop,
        goon,
        pause
    }
}
