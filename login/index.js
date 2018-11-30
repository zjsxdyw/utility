// plan A
var createRequest = (send, check, login) => {
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
const hookAjax = require("ajax-hook");
const map = {};
const realxhr = XMLHttpRequest;
let uid = 0;
let login = true;

const check = function(result) {
  return login;
};

const handler = function(xhr, event) {
  if(xhr.status >= 200 && xhr.status < 300) {
    let result;
    try {
      result = JSON.parse(xhr.response);
    } catch(e) {
      result = xhr.response;
    }
    if(check(result)) {
      map[xhr.uid].push({
        event,
        fn: xhr[event],
        xhr
      });
      return true;
    }
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
  //hook function
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

// login
login = false;
for(let key in map) {
  var xhr = new realxhr;
  for(let obj of map[key]) {
    if(obj.method) {
      xhr[obj.method].apply(xhr, obj.arg);
    } else if(obj.event) {
      xhr[obj.event] = function() {
        obj.fn.apply(obj.xhr, arguments);
      }
    }
  }
}
