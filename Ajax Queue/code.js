var ajaxForCallback = (function (_ajax) {
     var queue = [], idle = true;
     function run() {
         if (idle && queue.length !== 0) {
             var options = queue.shift();
             idle = false;
             var originalSuccess = options.success || noop,
                 originalError = options.error || noop;
             options.success = function (data, textStatus, jqXhr) {
                 originalSuccess.apply(this, arguments);
                 next();
             };
             options.error = function (data, textStatus, jqXhr) {
                 originalError.apply(this, arguments);
                 next();
             };
             _ajax(options);
         }
     }
     function next() {
         idle = true;
         run();
     }
     function noop(){}
     return function (url, options) {
         if (typeof url === "object") {
             options = url;
             url = undefined;
         } else {
             options.url = url;
         }
         queue.push(options);
         run();
     };
 })($.ajax);
var ajaxForPromise = (function($) {
    var promise = $.Deferred().resolve(),
        ajax = $.ajax;
    return function() {
        var args = [].slice.call(arguments);
        promise = promise.then(function() {
            return ajax.apply($, args);
        });
        return promise;
    }
})($);
