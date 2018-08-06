class PriorityQueue {
  constructor(fn) {
    this.heap = [null];
    this.compare = fn;
  }
  
  insert(item) {
    let i = this.heap.length;
    for(let j; i !== 1 && this.compare(this.heap[(j = i >> 1)], item) > 0; i = j) {
      this.heap[i] = this.heap[j];
    }
    this.heap[i] = item;
  }
  
  remove() {
    if(this.heap.length < 3) {
      const last = this.heap.pop();
      this.heap[0] = null;
      return last;
    }
    const item = this.heap[1];
    const temp = this.heap.pop();
    let i = 1;
    for(let j = i << 1, len = this.heap.length; j < len; i = j, j = i << 1) {
      if(j < len - 1 && this.compare(this.heap[j], this.heap[j+1]) > 0) {
        j++;
      }
      if(this.compare(this.heap[j], temp) >= 0) break;
      this.heap[i] = this.heap[j];
    }
    this.heap[i] = temp;
    return item;
  }
  
  isEmpty() {
    return this.heap.length === 1;
  }
}
