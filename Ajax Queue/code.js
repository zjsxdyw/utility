var ajaxForQueue = (function($) {
    var queue = [],
        idle = true,
        _ajax = $.ajax;

    function run() {
        if (idle && queue.length !== 0) {
            var obj = queue.shift(),
                args = obj.args,
                deferred = obj.deferred;
            idle = false;
            _ajax.apply($, obj.args).then(function() {
                deferred.resolve(arguments);
                next();
            }).fail(function() {
                deferred.reject(arguments);
                next();
            });
        }
    }

    function next() {
        idle = true;
        run();
    }

    return function() {
        var deferred = $.Deferred();
        var args = [].slice.call(arguments);
        queue.push({
            deferred:deferred,
            args: args
        });
        run();
        return deferred;
    }
})($);
