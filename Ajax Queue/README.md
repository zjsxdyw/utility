在开发过程中，我们可能会遇到一些页面初始化时（同步代码运行中）需要调用多个接口获取信息的情况。代码运行过程如下<br>
`$.ajax('/get/A', options);`<br>
`$.ajax('/get/B', options);`<br>
`$.ajax('/get/C', options);`<br>
`$.ajax('/get/D', options);`<br>
`$.ajax('/get/E', options);`<br>
对大多数浏览器来说并发的请求数的大致是4-8个，超过并发数后请求的响应会变得非常慢。<br>
因此我们可以使用ajaxForQueue来确保每次只发一个请求减少浏览器并发数从而加快响应速度。<br>
该方法支持success、fail式回调和.done.fail式回调。
