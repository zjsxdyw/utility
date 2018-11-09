class AsyncQueue {
    constructor(num) {
        this.length = num;
        this.queue = [];
        this.uid = 0;
        this.set = new Set();
    }

    add(callback) {
        this.queue.push({
            uid: this.uid++,
            fn: callback
        });
        run();
    }

    run() {
        while(this.set.size < this.length && this.queue.length) {
            let { uid, fn } = this.queue.shift();
            fn();
        }
    }

    done(uid) {
        if(this.set.has(uid)) {
            this.set.delete(uid);
        }
        run();
    }
}