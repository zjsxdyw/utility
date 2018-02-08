# 说明
将请求转为队列形式发送（第一个请求完成后发送第二个请求）。
# 使用
```
// 设置请求的并发数量
var ajaxQueue = queue(1);
ajaxQueue.ajax('/A');
ajaxQueue.ajax('/B');
ajaxQueue.ajax('/C');
ajaxQueue.ajax('/D');
ajaxQueue.ajax('/E');
```
