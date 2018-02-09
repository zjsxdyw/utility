/**
 * @params list {Array} - 要迭代的数组
 * @params limit {Number} - 并发数量控制数
 * @params asyncHandle {Function} - 对`list`的每一个项的处理函数，参数为当前处理项，必须 return 一个Promise来确定是否继续进行迭代
 * @return {Promise} - 返回一个 Promise 值来确认所有数据是否迭代完成
 */
let controller = (list, limit, asyncHandle) => {
	let promiseList = []; //Promise列表
	let resList = []; // 存储promiseList中的resolve和reject
	let index = 0; // 执行任务的索引
    let count = 0; // 当前并发数量
	let run = () => { // 执行函数
		while(count < limit && index < list.length) {
			let x = index++;
			asyncHandle(list[x]).then((res) => {
				resList[x].resolve(res);
			}).catch((err) => {
                resList[x].reject(err);
            }).finally(() => {
				count--;
				run();
            });
			count++;
		}
	};
	for(let i = 0, len = list.length; i < len; i++) {
		promiseList.push(new Promise((resolve, reject) => {
			resList.push({resolve, reject});
		}));
	}
	run();
	return Promise.all(promiseList);  // 所有并发异步操作都完成后，本次并发控制迭代完成
}
