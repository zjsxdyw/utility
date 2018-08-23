// 快排
function quicksort(arr, p, r) {
  if(p < r) {
    let q = partition(arr, p, r);
    quicksort(arr, p, q - 1);
    quicksort(arr, q + 1, r);
  }
}

function partition(arr, p, r) {
  let x = arr[r];
  let i = p;
  for(let j = p; j < r; j++) {
    if(arr[j] <= x) {
      [arr[j], arr[i]] = [arr[i], arr[j]];
      i++;
    }
  }
  [arr[r], arr[i]] = [arr[i], arr[r]];
  return i;
}

// 随机版快排
function randomizedQuicksort(arr, p, r) {
  if(p < r) {
    let q = randomizedPartition(arr, p, r);
    randomizedQuicksort(arr, p, q - 1);
    randomizedQuicksort(arr, q + 1, r);
  }
}

function randomizedPartition(arr, p, r) {
  let i = Math.floor(Math.random() * (r - p + 1) + p);
  [arr[r], arr[i]] = [arr[i], arr[r]];
  return partition(arr, p, r);
}

// 找到第k小的数
var findKth = function(arr, p, r, k) {
  if(p < r) {
    let q = randomizedPartition(arr, p, r);
    if(q > k) findKth(arr, p, q - 1, k);
    if(q < k) findKth(arr, q + 1, r, k);
  }
  return arr[k];
};
