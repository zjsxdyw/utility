var text = $('#content').html();

var page = '<div class="page"><div class="container"><div class="content"></div></div></div>';

$('.editContent').append($(page));

var body = new DOMParser().parseFromString(text, 'text/html').body;

var paras = body.children;

var index = 0;

let lastOver = 0;
let tdReg = /^td$/i;
let imgReg = /^img$/i;
let brReg = /^br$/i;

var count = body.querySelectorAll('img').length;

body.querySelectorAll('img').forEach((img) => {
  let src = img.src;
  img = new Image();
  img.src = src;
  img.onload = function() {
    count--;
    if(count === 0) fn();
  }
  img.onerror = function() {
    count--;
    if(count === 0) fn();
  }
});

function fn() {
  var para = paras[0];
  var last = 0;
  var scrollList = [];
  var count = 0;
  while(para) {
    let content = $('.content').last();
    let container = $('.container').last();
    content.append(para);
    let top = parseInt(content.children().first().css('margin-top'));
    let bottom = parseInt(content.children().last().css('margin-bottom'));
    let height = content.height();
    let pageHeight = container.height();
    if((height + top) > (pageHeight + last)) {
      let $para = $(para);
      let paraTop = parseInt($para.css('margin-top'));

      // 找到能完整显示的最后一行距底部的距离（为负数）
      let distance = getDistance(para, content.offset().top, pageHeight + last - top) || 0;
      lastOver = 0;
      // 超过接近一页则按0处理
      if(Math.abs(distance) > pageHeight - 50) distance = 0;

      last = $para.height() + paraTop - (height + top - pageHeight) + last + distance;
      container.height(container.height() + distance);
      $('.editContent').append($(page));
      count++;
      para = para.cloneNode(true);
      scrollList.push({
        index: count,
        top: last + (/^table$/i.test(para.tagName) ? 1 : 0)
      });
    } else {
      para = paras[0];
    }
  }

  scrollList.forEach(function(item) {
    let container = $('.container').eq(item.index);
    let content = container.find('.content');
    let height = container.height();
    while(item.top && content.height() < height + item.top) {
      content.append('<div style="user-select: none;"><br></div>');
    }
    container.scrollTop(item.top);
  });


  function getDistance(dom, offsetTop, remain) {
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
          return lastOver || (over - offset.height);
        } else {
          lastOver = over;
        }
      }
    } else if(tdReg.test(dom.tagName)) {
      let selection = document.getSelection();
      let range = new Range();
      selection.removeAllRanges();
      range.setStart(dom, 0);
      range.setEnd(dom, dom.childNodes.length);
      selection.addRange(range);
      let offset = range.getBoundingClientRect();
      selection.removeRange(range);
      let over = offset.top - offsetTop + offset.height - remain;
      if(over > 0) {
        console.log(dom, lastOver, -offset.height + over);
        return lastOver || (over - offset.height);
      } else {
        lastOver = over;
      }
    } else if(imgReg.test(dom.tagName) || brReg.test(dom.tagName)) {
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
        console.log(dom, lastOver, -offset.height + over);
        return over - offset.height;
      } else {
        lastOver = over;
      }
    } else {
      for(let i = 0, len = dom.childNodes.length; i < len; i++) {
        let result = getDistance(dom.childNodes[i], offsetTop, remain);
        if(result !== undefined) return result;
      }
    }
  }
}