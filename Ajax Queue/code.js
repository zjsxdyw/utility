// Plan A
var ajaxForQueue = (function($) {
    var queue = [],
        _ajax = $.ajax;

    function next(done) {
        if(done) {
            queue.shift();
        }
        if(queue.length) {
            queue[0].resolve();
        }
    }

    return function() {
        var deferred = $.Deferred(),
            promise = $.Deferred(),
            args = [].slice.call(arguments);

        queue.push(promise);

        promise.then(function() {
            return _ajax.apply($, args);
        }).then(function() {
            deferred.resolve.apply(deferred, [].slice.call(arguments));
            next(true);
        }).fail(function() {
            deferred.reject.apply(deferred, [].slice.call(arguments));
            next(true);
        });

        next();

        return deferred;
    }
})($);
// Plan B
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
                deferred.resolve.apply(deferred, [].slice.call(arguments));
                next();
            }).fail(function() {
                deferred.reject.apply(deferred, [].slice.call(arguments));
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
