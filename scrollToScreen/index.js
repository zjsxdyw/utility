/**
 * @params dom {HTMLElement} - 要移动的元素
 * @params scrollDom {HTMLElement} - 含有滚动条的元素
 * @params extraOffset {Object} - 额外添加的offset
 */
// jQuery版本
const scrollToScreen = (dom, scrollDom, extraDom) => {
  scrollDom = $(scrollDom);
  dom = $(dom);
  if(!dom.length || !scrollDom.length) return;
  let domOffset = dom.offset();
  extraDom = $(extraDom);
  if(extraDom.length) {
    let extraOffset = extraDom.offset();
    domOffset.top += extraOffset.top;
    domOffset.left += extraOffset.left;
  }
  let scrollDomOffset = scrollDom.offset();
  let outerHeight = extraDom.length ? extraDom.outerHeight() : dom.outerHeight();
  if(domOffset.top - scrollDomOffset.top < 0) {
    scrollDom.scrollTop(scrollDom.scrollTop() + domOffset.top - scrollDomOffset.top);
  } else if(domOffset.top - scrollDomOffset.top + outerHeight > scrollDom.outerHeight()) {
    scrollDom.scrollTop(scrollDom.scrollTop() + domOffset.top - scrollDomOffset.top + outerHeight - scrollDom.outerHeight() + 5);
  }
}
