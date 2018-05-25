var equals = function (x, y) {
    var typeX = Object.prototype.toString.call(x),
        typeY = Object.prototype.toString.call(y);
    if (typeX !== typeY) return false;
    if (typeX === '[object Array]') {
        if (x.length !== y.length) return false;
        for (var i = 0, len = x.length; i < len; i++) {
            if (!equals(x[i], y[i])) return false;
        }
    } else if (typeX === '[object Object]') {
        var key;
        for (key in x) {
            if (x.hasOwnProperty(key) !== y.hasOwnProperty(key)) return false;
        }
        for (key in y) {
            if (x.hasOwnProperty(key) !== y.hasOwnProperty(key)) return false;
            if (!equals(x[key], y[key])) return false;
        }
    } else if (typeX === '[object RegExp]' || typeY === '[object Function]') {
        return x.toString() === y.toString();
    } else if (x !== y) {
        return false;
    }
    return true;
}
