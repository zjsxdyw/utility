const objKeyToLowerCase = (obj, initial) => {
    let reg = initial ? /^\S/ : /\S/g;
    for (let key in obj) {
        let str = key.replace(reg, function (s) { return s.toLowerCase() });
        if (str !== key) {
            obj[str] = obj[key];
            delete obj[key];
        }
        if (Array.isArray(obj[str]) || Object.prototype.toString.call(obj[str]) === '[object Object]') {
            obj[str] = objKeyToLowerCase(obj[str]);
        }
    }
    return obj;
}
