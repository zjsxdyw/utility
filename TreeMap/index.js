class TreeNode {
  /**
   * Initialize data structure.
   */
  constructor(key, value, parent) {
    this.key = key;
    this.value = value;
    this.parent = parent;
    this.left = null;
    this.right = null;
  }

  insertNode(key, value) {
    if(key < this.key) {
      if(this.left) return this.left.insertNode(key, value);
      else {
        this.left = new TreeNode(key, value, this);
        return this.left;
      }
    } else if(key > this.key) {
      if(this.right) return this.right.insertNode(key, value);
      else {
        this.right = new TreeNode(key, value, this);
        return this.right;
      }
    } else {
      this.value = value;
      return this;
    }
  }
}

class TreeMap {
  /**
   * Initialize data structure.
   */
  constructor() {
    this.root = null;
    this.map = {};
  }
  
  /**
   * Get value by key.
   * @param {Number} key
   * @return {Any}
   */
  get(key) {
    return this.map[key] ? this.map[key].value : null;
  }
  
  /**
   * Set value to TreeMap. 
   * @param {Number} key
   * @param {Any} value
   * @return {void}
   */
  set(key, value) {
    if(this.root) this.map[key] = this.root.insertNode(key, value);
    else {
      this.root = new TreeNode(key, value, null);
      this.map[key] = this.root;
    }
  }
  
  /**
   * Get lower key
   * @param {Number} key
   * @return {Number}
   */
  lowerKey(key) {
    if(!this.map[key]) return null;
    let node = this.map[key];
    if(node.left) {
      let p = node.left;
      while(p.right) {
        p = p.left;
      }
      return p.key;
    } else {
      let p = node.parent;
      while(p && node === p.left) {
        node = p;
        p = p.parent;
      }
      return p ? p.key : null;
    }
  }

  /**
   * Get higher key
   * @param {Number} key
   * @return {Number}
   */
  higherKey(key) {
    if(!this.map[key]) return null;
    let node = this.map[key];
    if(node.right) {
      let p = node.right;
      while(p.left) {
        p = p.right;
      }
      return p.key;
    } else {
      let p = node.parent;
      while(p && node === p.right) {
        node = p;
        p = p.parent;
      }
      return p ? p.key : null;
    }
  }
}
