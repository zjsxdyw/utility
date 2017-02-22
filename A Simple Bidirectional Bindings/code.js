var isArray = Array.isArray;
var isObject = function(obj) {
  return obj && obj.toString() === '[object Object]';
};
function observe(obj) {
    if(isArray(obj)) {
        observeArray(obj);
    } else if(isObject(obj)) {
        Object.keys(obj).forEach(function(key){
            observerObject(obj, key);
        });
    }
    return;
}
function observerObject(obj, k) {
    let old = obj[k];
    const dep = new Dep();
    observe(obj[k]);
    Object.defineProperty(obj, k, {
        enumerable: true,
        configurable: true,
        get() {
            if(Dep.target) {
                dep.addSub(Dep.target);
            }
            return old;
        },
        set(now) {
            if(now !== old) {
                observe(now);
                dep.notify(now, old);
            }
            old = now;
        }
    });
}
function observeArray(arr) {
    arr.forEach(function(item){
        observe(item);
    });
    const dep = new Dep();
    const oam = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'];
    const arrayProto = Array.prototype;
    const hackProto = Object.create(Array.prototype);
    oam.forEach(function(method){
        Object.defineProperty(hackProto, method, {
            writable: true,
            enumerable: true,
            configurable: true,
            value: function(...arg) {
                let me = this;
                let old = arr.slice();
                let now = arrayProto[method].call(me, ...arg);
                dep.notify(me, old);
                return now;
            },
        });
    });
    Object.defineProperty(arr, 'toString', {
        writable: true,
        enumerable: true,
        configurable: true,
        value: function(...arg) {
            if(Dep.target) {
                dep.addSub(Dep.target);
            }
            let me = this;
            let old = arr.slice();
            let now = arrayProto.toString.call(me, ...arg);
            return now;
        },
    });
    arr.__proto__ = hackProto;
}
class Dep {
    constructor() {
        this.subs = [];
    }
    addSub(sub){
        this.subs.push(sub);
    }
    notify(nowValue, oldValue){
        this.subs.forEach(sub=>sub.update(nowValue, oldValue));
    }
}
class Dbinding {
    constructor(options) {
        this._data = options.data;
        this.$el = document.querySelector(options.el);
        observe(this._data);
        this.retrieveDom(this.$el, this._data);
    }
    retrieveDom(node, data) {
        if(!node.getAttribute)return;
        if(!node.getAttribute('data-repeat')) {
            this.retrieveAttributes(node, data);
            for(let i = 0, len = node.childNodes.length; i < node.childNodes.length; i++) {
                this.retrieveDom(node.childNodes[i], data);
                if(len !== node.childNodes.length){
                    i += node.childNodes.length - len;
                    len = node.childNodes.length;
                }
            }
        } else {
            this.parseList(node, data);
        }
    }
    retrieveAttributes(node, data) {
        for(let i = 0; i < node.attributes.length; i++) {
            const match = node.attributes[i].name.match(/data-(.*)/);
            if(match && match[1]) {
                const dataInfo = this.parseData(node.attributes[i].value, data);
                switch(match[1]) {
                case 'bind':
                    this.bindData(node, dataInfo);
                    break;
                case 'class':
                    this.bindClass(node, dataInfo);
                    break;
                default:
                    this.bindEvent(node, match[1], dataInfo);
                    break;
                }
                Dep.target = null;
            }
        }
    }
    parseData(str, data) {
        try {
            let key = str;
            let obj = data;
            let index = key.indexOf('.');
            let value;
            while(index > -1) {
                obj = obj[key.substring(0, index).trim()];
                key = key.substring(index + 1);
                index = key.indexOf('.');
            }
            return {
                obj: obj,
                key: key
            }
        } catch(e) {
            console.error('Can not find ' + str + ' in your data');
            return;
        }
    }
    bindData(node, dataInfo) {
        if(dataInfo) {
            const obj = dataInfo.obj;
            const key = dataInfo.key;
            Dep.target = {
                update: function(nowValue, oldValue) {
                    node.childNodes[0].nodeValue = nowValue;
                }
            };
            const textNode = document.createTextNode(obj[key]);
            node.insertBefore(textNode, node.childNodes[0]);
            Dep.target = null;
        }
    }
    bindClass(node, dataInfo) {
        if(dataInfo) {
            const obj = dataInfo.obj;
            const key = dataInfo.key;
            Dep.target = {
                update: function(nowValue, oldValue) {
                    node.className = obj[key];
                }
            };
            node.className = obj[key];
            Dep.target = null;
        }
    }
    bindEvent(node, event, dataInfo) {
        if(dataInfo) {
            const obj = dataInfo.obj;
            const key = dataInfo.key;
            if(typeof obj[key] === 'function') {
                Dep.target = {
                    update: function(nowValue, oldValue) {
                        node.removeEventListener(event, oldValue);
                        node.addEventListener(event, nowValue);
                    }
                };
                node.addEventListener(event, obj[key]);
                Dep.target = null;
            }
        }
    }
    parseList(node, data) {
        const arr = node.getAttribute('data-repeat').split('in');
        const item = arr[0].trim();
        const key = arr[1].trim();
        const dataInfo = this.parseData(key, data);
        const self = this;
        const parentNode = node.parentNode;
        const nextNode = node.nextSibling;
        let nodeList = [];
        let dataValue;
        if(isArray(dataInfo && (dataValue = dataInfo.obj[dataInfo.key]))){
            const dom = node.cloneNode(true);
            Dep.target = {
                update: function(nowValue, oldValue) {
                    let len = nodeList.length;
                    self.generateList(dom, dataValue, data, parentNode, nextNode, nodeList, item);
                    for(let i = 0; i < len; i++) {
                        nodeList[i].remove();
                    }
                    nodeList = nodeList.slice(len);
                }
            };
            dataValue.toString();
            Dep.target = null;
            this.generateList(dom, dataValue, data, parentNode, nextNode, nodeList, item);
            node.remove();
        } else {
            console.error('parameter is not an array');
        }
    }
    generateList(dom, dataValue, data, parentNode, nextNode, nodeList, item) {
        for(let i = 0; i < dataValue.length; i++) {
            const temp = dom.cloneNode(true);
            const obj = Object.create(data);
            obj[item] = dataValue[i];
            const value = temp.getAttribute('data-repeat');
            temp.removeAttribute('data-repeat');
            parentNode.insertBefore(temp, nextNode);
            this.retrieveDom(temp, obj);
            temp.setAttribute('data-repeat', value);
            nodeList.push(temp);
        }
    }
}
