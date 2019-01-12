class TrieNode {
  /**
   * Initialize data structure.
   */
  constructor() {
    this.children = {};
    this.isWord = false;
  }
}

class Trie {
  /**
   * Initialize data structure.
   */
  constructor() {
    this.root = new TrieNode();
  }
  
  /**
   * Inserts a word into the trie. 
   * @param {string} word
   * @return {void}
   */
  insert(word) {
    let p = this.root;
    for(let char of word) {
        if(!p.children[char]) p.children[char] = new TrieNode();
        p = p.children[char];
    }
    p.isWord = true;
  }
  
  /**
   * Returns if the word is in the trie. 
   * @param {string} word
   * @return {boolean}
   */
  search(word) {
    let p = this.root;
    for(let char of word) {
        if(!p.children[char]) return false;
        p = p.children[char];
    }
    return p.isWord;
  }
  
  /**
   * Returns if there is any word in the trie that starts with the given prefix. 
   * @param {string} prefix
   * @return {boolean}
   */
   startsWith(prefix) {
      let p = this.root;
      for(let char of prefix) {
          if(!p.children[char]) return false;
          p = p.children[char];
      }
      return true;
   }
}
