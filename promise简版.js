console.log('——————————————————————————手写的promise——————————————————————')
const PENDING = 'pending'
const FULLFILLED = 'fullFilled'
const REJECTED = 'rejected'


class Promise {
  constructor(executor) {
    this.value = undefined;
    this.reason = undefined;
    this.status = PENDING
    // 两个队列 专门存成功的和失败的 为了处理异步 发布订阅模式
    this.onResolvedCallBacks = []
    this.onRejectedCallBacks = []

    let resolve = (value) => {
      // 只有pending状态时才可以改变promise的状态
      if (this.status === PENDING) {
        this.status = FULLFILLED
        this.value = value
        this.onResolvedCallBacks.forEach(fn => fn())
      }
    }
    let reject = (reason) => {
      if (this.status === PENDING) {
        this.status = REJECTED
        this.reason = reason
        this.onRejectedCallBacks.forEach(fn => fn())
      }
    }
    // 传递一个执行器 执行器会立即执行
    // 这里可能会发生异常
    try{
      executor(resolve, reject)
    } catch (e) {
      reject(e)
    }
  }

  // then方法会判断当前的状态
  then(onFullfilled, onRejected) {
    if (this.status === FULLFILLED) {
      onFullfilled(this.value)
    }
    if (this.status === REJECTED) {
      onRejected(this.reason)
    }
    // 异步 pending 时调用then   resolve 需要在 then 之后执行
    if (this.status === PENDING) {
      // ** todo
      this.onResolvedCallBacks.push(() => {
        onFullfilled(this.value)
      })
      this.onRejectedCallBacks.push(() => {
        onRejected(this.reason)
      })
    }
  }
}
module.exports = Promise
