// plan A
const createRequest = (send, check, login) => {
  let arr = [];
  let isLogin = false;

  const gotoLogin = () => {
    isLogin = true;
    login().then(() => {
      isLogin = false;
      arr.forEach(({ resolve, args }) => {
        resolve(handler.apply(null, args));
      });
    }).catch((err) => {
      isLogin = false;
      arr.forEach(({ reject }) => {
        reject(err);
      });
    }).finally(() => {
        arr = [];
    });
  }
  const handler = (...args) => {
    return new Promise((resolve, reject) => {
      if(isLogin) {
        arr.push({ resolve, reject, args });
      } else {
        send.apply(null, args).then((res) => {
          if(check(res)) {
            arr.push({ resolve, reject, args });
            gotoLogin();
          } else resolve(res);
        }).catch((err) => {
          if(check(err)) {
            arr.push({ resolve, reject, args });
            gotoLogin();
          } else reject(err);
        });
      }
    });
  }
  return handler;
}

// plan B
// https://www.npmjs.com/package/ajax-hook
const hookAjax = require("ajax-hook").hookAjax;

const interceptor = (check, login) => {
  const map = {};
  const realxhr = XMLHttpRequest;
  let uid = 0;
  let isLogin = false;

  const success = () => {
    isLogin = false;
    for(let key in map) {
      let xhr = new realxhr;
      for(let obj of map[key]) {
        if(obj.method) {
          xhr[obj.method].apply(xhr, obj.arg);
        } else if(obj.event) {
          xhr[obj.event] = (...args) => {
            obj.fn.apply(obj.xhr, args);
          }
        }
      }
    }
  }

  const error = (...args) => {
    for(let key in map) {
      for(let obj of map[key]) {
        if(obj.event === 'onerror') {
          obj.fn.apply(obj.xhr, args);
          break;
        }
      }
    }
  }

  const handler = (xhr, event) => {
    if(check(xhr)) {
      map[xhr.uid].push({
        event,
        fn: xhr[event],
        xhr
      });
      if(!isLogin) {
        isLogin = true;
        let p = login(success, error);
        if(p instanceof Promise) {
          p.then(success).catch(error);
        }
      }
      return true;
    }
    delete map[xhr.uid];
  }
  
  hookAjax({
    //hook callbacks
    onreadystatechange(xhr) {
      if(xhr.readyState === 4) {
        return handler(xhr, 'onreadystatechange');
      }
    },
    onload(xhr) {
      return handler(xhr, 'onload');
    },
    onerror(xhr) {
      delete map[xhr.uid];
    },
    onabort(xhr) {
      delete map[xhr.uid];
    },
    ontimeout() {
      delete map[xhr.uid];
    },
    //hook functions
    open(arg, xhr) {
      this.uid = uid++;
      map[this.uid] = [];
      map[this.uid].push({
        method: 'open',
        arg
      });
    },
    send(arg, xhr) {
      map[this.uid].push({
        method: 'send',
        arg
      });
    },
    setRequestHeader(arg, xhr) {
      map[this.uid].push({
        method: 'setRequestHeader',
        arg
      });
    }
  });
}

module.export = interceptor;

// test
let needLogin = true;

const check = function(result) {
  return needLogin;
}

const login = function(done) {
  setTimeout(() => {
    needLogin = false;
    done();
  }, 5000)
}

interceptor(check, login);
