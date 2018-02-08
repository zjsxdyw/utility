/**
 * @params list {Array} - 要迭代的数组
 * @params limit {Number} - 并发数量控制数
 * @params asyncHandle {Function} - 对`list`的每一个项的处理函数，参数为当前处理项，必须 return 一个Promise来确定是否继续进行迭代
 * @return {Promise} - 返回一个 Promise 值来确认所有数据是否迭代完成
 */
let controller = (list, limit, asyncHandle) => {
    //TODO
    return Promise.all();  // 所有并发异步操作都完成后，本次并发控制迭代完成
}
