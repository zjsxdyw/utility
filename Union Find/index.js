function makeSet(x) {
  x.parent = x;
  x.rank = 0;
}

function find(x) {
  if(x.parent !== x) 
    x.parent = find(x.parent);
  return x.parent;
}

function union(x, y) {
  let xRoot = find(x);
  let yRoot = find(y);
  if(xRoot === yRoot) return;
  
  if(xRoot.rank < yRoot.rank)
    [xRoot, yRoot] = [yRoot, xRoot];
    
  yRoot.parent = xRoot;
  
  if(xRoot.rank === yRoot.rank)
    xRoot += 1;
}

class UnionFind {
  constructor() {
    this.parents = [];
    this.ranks = [];
  }
  
  makeSet(x) {
    this.parents[x] = x;
    this.ranks[x] = 0;
  }
  
  find(x) {
    if(this.parents[x] !== x)
      this.parents[x] = find(this.parents[x]);
    return this.parents[x];
  }
  
  union(x, y) {
    let xRoot = find(x);
    let yRoot = find(y);
    if(xRoot === yRoot) return;

    if(this.ranks[xRoot] < this.ranks[yRoot])
      [xRoot, yRoot] = [yRoot, xRoot];

    this.parents[yRoot] = xRoot;
    
    if(this.ranks[xRoot] === this.ranks[yRoot])
      this.ranks[xRoot] += 1;
  }
}
