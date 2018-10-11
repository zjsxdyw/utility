function binarySearch (list, value, direction) {
  let start = 0;
  let end = list.length - 1;

  while (start <= end) {
    const mid = start + Math.floor((end - start) / 2);
    if(list[mid] === value) return mid;
    if (value < list[mid]) {
      end = mid - 1;
    } else {
      start = mid + 1;
    }
  }
  if(!direction) return -1;
  // right search
  if(direction > 0) return start;
  // left serach
  return end;
}
