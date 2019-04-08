var text = $('#content').html();

var page = '<div class="page"><div class="container"><div class="content"></div></div></div>';

$('.editContent').append($(page));

var body = new DOMParser().parseFromString(text, 'text/html').body;

var bodyClone = body.cloneNode(true);

var editContent = document.querySelector('.editContent');
var copyContent = document.querySelector('.copyContent');
while(bodyClone.childNodes[0]) {
  copyContent.appendChild(bodyClone.childNodes[0]);
}

var count = body.querySelectorAll('img').length;

body.querySelectorAll('img').forEach((img) => {
  let container = $('.container').last();
  let width = container.width();
  let height = container.height();
  let src = img.src;
  img = new Image();
  img.src = src;
  img.onload = function() {
    let imgWidth = parseInt(img.width, 10);
    let imgHeight = parseInt(img.height, 10);
    if(isNaN(imgWidth)) imgWidth = width;
    if(isNaN(imgHeight)) imgWidth = height;
    if(imgWidth > width) {
      imgHeight = imgHeight * (width / imgWidth) | 0;
      imgWidth = width;
    }
    if(imgHeight > height) {
      imgWidth = imgWidth * (height / imgHeight) | 0;
      imgHeight = height;
    }
    img.width = imgWidth;
    img.height = imgHeight;

    count--;
    if(count === 0) fn();
  }
  img.onerror = function() {
    count--;
    if(count === 0) fn();
  }
});


function fn() {

  body.querySelectorAll('table').forEach((table) => {
    let container = $('.container').last();
    let width = container.width();
    let tableWidth = parseInt(table.width, 10);
    if(isNaN(tableWidth)) tableWidth = width;
    if(tableWidth > width) {
      table.width = width;
    } else {
      table.width = tableWidth;
    }
  });

  var paras = body.children;

  var index = 0;

  var para = paras[0];
  var count = 0;
  while(para) {
    let content = $('.content').last();
    let container = $('.container').last();
    content.append(para);
    let marginTop = parseInt(content.children().first().css('margin-top'));
    let marginBottom = parseInt(content.children().last().css('margin-bottom'));
    let height = content.height();
    let pageHeight = container.height();
    if((height + marginTop) > (pageHeight)) {
      let $para = $(para);
      let paraTop = parseInt($para.css('margin-top'));

      // 找到能完整显示的最后一行距底部的距离（为负数）
      let overDom = getOverDom(para, container.offset().top, pageHeight, true) || 0;

      // 创建新页
      $('.editContent').append($(page));
      count++;

      // 赋值下一段内容
      if(overDom === content.children().get(0)) {
        para = paras[0];
      } else {
        para = overDom || paras[0];
      }

      if(pageHeight < content.height() + marginTop)
        container.height(content.height() + marginTop);

    } else {
      para = paras[0];
    }
  }

  if(!$('.content').last().children().length) {
    $('.page').last().remove();
  }

  function getOverDom(dom, offsetTop, remain) {
    let arr = [];
    // 处理表格
    if(isTag(dom, ['table', 'tbody'])) {
      for(let i = 0, len = dom.childNodes.length; i < len; i++) {
        let offset = getRangeClinetRect(dom.childNodes[i]);
        let over = offset.top - offsetTop + offset.height - remain;
        if(over > 0) {
          if(isTag(dom.childNodes[i], 'caption')) {
            let result = dfs(dom.childNodes[i], offsetTop, remain, arr);
            if(result.isFirst) return dom;
            let caption = extractContents(dom.childNodes[i], result.dom, result.i);
            let table = cloneNode(dom);
            table.appendChild(caption);
            i++;
            while(dom.childNodes[i]) {
              table.appendChild(dom.childNodes[i]);
            }
            return table;
          } else if(isTag(dom.childNodes[i], 'tbody')) {
            let tbody = getOverDom(dom.childNodes[i], offsetTop, remain);
            if(i === 0 && tbody === dom.childNodes[i]) return dom;
            let table = cloneNode(dom);
            table.appendChild(tbody);
            i++;
            while(dom.childNodes[i]) {
              table.appendChild(dom.childNodes[i]);
            }
            return table;
          } else if(isTag(dom.childNodes[i], 'tr')) {
            let tr = dom.childNodes[i];
            let tds = [];
            for(let j = 0, n = tr.childNodes.length; j < n; j++) {
              let result = dfs(tr.childNodes[j], offsetTop, remain - 5, []);
              tds.push(result);
            }
            if(tds.every((result) => { return result && result.isFirst})) {
              if(i === 0) return dom;
              else {
                let tbody = cloneNode(dom);
                while(dom.childNodes[i]) {
                  tbody.appendChild(dom.childNodes[i]);
                }
                return tbody;
              }
            }
            let tempTr = cloneNode(dom.childNodes[i]);
            for(let j = 0, n = tr.childNodes.length; j < n; j++) {
              let td;
              if(tds[j]) td = extractContents(tr.childNodes[j], tds[j].dom, tds[j].i);
              else td = cloneNode(tr.childNodes[j]);
              tempTr.appendChild(td);
            }
            let tbody = cloneNode(dom);
            tbody.appendChild(tempTr);
            i++;
            while(dom.childNodes[i]) {
              tbody.appendChild(dom.childNodes[i]);
            }
            return tbody;
          }
        }
      }
      return;
    }

    let result = dfs(dom, offsetTop, remain, arr);
    console.log(arr);

    if(result && arr.length) {
      let node;
      let lastNode;
      while(arr.length) {
        let obj = arr.shift();
        let {dom, isFirst} = obj;
        switch(true) {
        case isTag(dom, ['p', 'h\\d']):
          if(isFirst) {
            node = dom;
          } else {
            node = extractContents(dom, result.dom, result.i);
            node.style.marginTop = 0;
          }
          break;
        case isTag(dom, 'li'):
          lastNode = dom;
          if(isFirst) {
            dom.appendChild(node);
            node = dom;
          } else {
            let temp = cloneNode(obj.dom);
            temp.appendChild(node);
            temp.style.listStyleType = 'none';
            node = temp;
          }
          break;
        case isTag(dom, ['ol', 'ul']):
          if(isFirst) {
            dom.appendChild(node);
            node = dom;
          } else {
            let start = 0;
            let temp = cloneNode(dom);
            for(let i = 0, len = dom.children.length; i < len; i++) {
              if(dom.children[i] === lastNode) {
                start = i;
                break;
              }
            }
            let lastStart = (dom.getAttribute('start') || 1) - 1;
            temp.setAttribute('start', start + 1 + lastStart);
            temp.appendChild(node);
            if(node !== lastNode) {
              start += 1;
            }
            while(dom.children[start]) {
              temp.appendChild(dom.children[start]);
            }
            node = temp;
            node.style.marginTop = 0;
          }
          break;
        }
      }
      return node;
    }
  }

  function extractContents(pNode, node, index) {
     let selection = document.getSelection();
      let range = new Range();
      selection.removeAllRanges();
      range.setStart(node, index);
      range.setEnd(pNode, pNode.childNodes.length);
      selection.addRange(range);
      let extractNode = range.extractContents();
      let p = cloneNode(pNode);
      p.style.textIndent = '';
      p.append(extractNode);
      selection.removeAllRanges();
      return p;
  }

  function getRangeClinetRect() {
    let args = arguments;
    let selection = document.getSelection();
    let range = new Range();
    selection.removeAllRanges();
    if(args.length === 4) {
      range.setStart(args[0], args[1]);
      range.setEnd(args[2], args[3]);
    } else if(args.length === 2) {
      range.setStartBefore(args[0]);
      range.setEndAfter(args[1]);
    } else if(args.length === 1) {
      range.setStartBefore(args[0]);
      range.setEndAfter(args[0]);
    }
    selection.addRange(range);
    let offset = range.getBoundingClientRect();
    selection.removeRange(range);
    return offset
  }

  function dfs(dom, offsetTop, remain, arr) {
    if(dom.nodeType === 3) {
      let selection = document.getSelection();
      let range = new Range();
      selection.removeAllRanges();

      for(let i = 0, len = dom.data.length; i < len; i++) {
        range.setStart(dom, i);
        range.setEnd(dom, i + 1);
        selection.addRange(range);
        let offset = range.getBoundingClientRect();
        selection.removeRange(range);
        let over = offset.top - offsetTop + offset.height - remain;
        if(over > 0) {
          return { dom, i, isFirst: i === 0 };
        }
      }
    } else if(isTag(dom, 'img') || isTag(dom, 'br')) {
      let selection = document.getSelection();
      let range = new Range();
      selection.removeAllRanges();
      range.setStartBefore(dom);
      range.setEndAfter(dom);
      selection.addRange(range);
      let offset = range.getBoundingClientRect();
      selection.removeRange(range);
      let over = offset.top - offsetTop + offset.height - remain;
      if(over > 0) {
        return { dom, i: 0, isFirst: true };
      }
    } else {
      for(let i = 0, len = dom.childNodes.length; i < len; i++) {
        let result = dfs(dom.childNodes[i], offsetTop, remain, arr);
        if(result) {
          result.isFirst = result.isFirst && i === 0;
          if(isTag(dom, ['p', 'h\\d', 'ol', 'ul', 'li'])) arr.push({dom, isFirst: result.isFirst});
          return result;
        }
      }
    }
  }

  function isTag(node, list) {
    if(typeof list === 'string') {
      list = [list];
    }
    let tagNames = list.join('|');
    let reg = new RegExp(`^(${tagNames})$`, 'i');
    return reg.test(node.tagName);
  }


  function cloneNode(dom, deep) {
    let node = dom.cloneNode(deep);
    let cloneNum = Number(dom.getAttribute('data-clone') || 0);
    node.setAttribute('data-clone', ++cloneNum);
    return node;
  }

  document.addEventListener('copy', function(e) {
    let selection = document.getSelection();
    let range = selection.getRangeAt(0);
    if(!isEditRange(isEditRange)) return;
    let startParentNode = findParentNode(range.startContainer);
    let endParentNode = findParentNode(range.endContainer);
    if(startParentNode === endParentNode || !startParentNode || !endParentNode) return;

    let startDataId = startParentNode.getAttribute('data-id');
    let startIndex = Number(startParentNode.getAttribute('data-clone') || 0);
    let startNodes = editContent.querySelectorAll(`[data-id="${startDataId}"]`);

    let startPostion = findRelativePostion(range.startContainer, range.startOffset, startParentNode);
    for(let i = startIndex - 1; i >= 0; i--) {
      startPostion += (startNodes[i].innerText || startNodes[i].textContent).length;
    }

    let endDataId = endParentNode.getAttribute('data-id');
    let endIndex = Number(endParentNode.getAttribute('data-clone') || 0);
    let endNodes = editContent.querySelectorAll(`[data-id="${endDataId}"]`);

    let endPostion = findRelativePostion(range.endContainer, range.endOffset, endParentNode);
    for(let i = endIndex - 1; i >= 0; i--) {
      endPostion += (endNodes[i].innerText || endNodes[i].textContent).length;
    }

    let x = getOffsetByPostion(copyContent.querySelector(`[data-id="${startDataId}"]`), startPostion);
    let y = getOffsetByPostion(copyContent.querySelector(`[data-id="${endDataId}"]`), endPostion);

    let copyRange = new Range();
    copyRange.setStart(x.node, x.postion);
    copyRange.setEnd(y.node, y.postion);

    selection.removeAllRanges();
    selection.addRange(copyRange);
    document.execCommand('copy');
    selection.removeAllRanges();
    selection.addRange(range);
    // debugger;

    e.preventDefault();
  });

  function findParentNode(node) {
    while(node) {
      if(node.nodeType === 1 && node.getAttribute('data-id')) return node;
      node = node.parentNode;
    }
  }

  function findRelativePostion(textNode, startPostion, pNode) {
    let postion = 0;
    let node = textNode;
    while(node && (node.parentNode !== pNode || node.previousSibling)) {
      postion += node === textNode ? startPostion : (node.innerText || node.textContent).length;
      if(!node.previousSibling && node.parentNode === pNode) return postion;
      node = node.previousSibling || node.parentNode.previousSibling;
    }
    return postion;
  }

  function isEditRange(range) {
    let start = range.startContainer;
    let end = range.endContainer;
    let x = false;
    let y = false;
    while(start) {
      if(start.nodeType === 1 && start.getAttribute('class') === 'editContent') {
        x = true;
        break;
      }
      start = start.parentNode;
    }
    while(end) {
      if(end.nodeType === 1 && end.getAttribute('class') === 'editContent') {
        y = true;
        break;
      }
      end = end.parentNode;
    }
    return x && y;
  }

  function getOffsetByPostion(pNode, postion) {
    if(pNode.nodeType === 3 && pNode.data.length > postion) {
      return {
        node: pNode,
        postion
      };
    }
    let nodes = pNode.childNodes;
    for(let i = 0, len = nodes.length; i < len; i++) {
      let length = (nodes[i].innerText || nodes[i].textContent).length;
      if(postion > length) {
        postion -= length;
      } else {
        return getOffsetByPostion(nodes[i], postion);
      }
    }
  }
};