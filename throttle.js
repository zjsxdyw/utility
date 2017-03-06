var throttle = function (func, limit) {
    var inThrottle,
      lastFunc,
      throttleTimer;
    return function () {
        var content = this,
          args = arguments;
        if (inThrottle) {
            clearTimeout(lastFunc);
            return lastFunc = setTimeout(function () {
                func.apply(content, args);
                inThrottle = false;
            }, limit);
        } else {
            func.apply(content, args);
            inThrottle = true;
            return throttleTimer = setTimeout(function () {
                return inThrottle = false;
            }, limit);
        }
    };
};
