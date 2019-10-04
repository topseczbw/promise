console.log('——————————————————————————手写的promise——————————————————————')
const PENDING = 'pending'
const FULLFILLED = 'fullFilled'
const REJECTED = 'rejected'


function resolvePromise(promise2, x, resolve, reject) {
  // console.log(promise2)
  // 处理x的类型 来决定是调用resolve还是reject
  // resolve(x)

  // 不用处理代码抛错，以为外部已经处理了
  // 判断x是不是promise2自己
  if (promise2 === x) {
    return reject(new TypeError('Chaining cycle detected for promise'))
  }
  // 判断x是不是一个普通值 先认为你是promise
  if ((typeof x === 'object' && x!== null) || typeof x === 'function') {
    // 可能是promise，
    // 如何判断是不是promise  判断是不是对象/方法 && 看一看当前对象上有没有then方法

    // 极端情况
    // i = 0
    // Object.defineProperty(x, 'then', {
    //   get:function () {
    //     i++
    //     if (i > 2) {
    //       throw new Error('111')
    //     }
    //   }
    // })
    let called
    try {
      // 是promise了
      let then = x.then
      if (typeof then === 'function') {
        // 如果是一个promise就采用这个promise的结果
        // 防止极端情况 不用x.then 这个会再次取then方法
        then.call(x, (y) => {
          // 防止多次调用
          if (called) return
          called = true
          // y 有可能还是promise， 实现递归解析
          resolvePromise(promise2, y, resolve, reject)
        }, (r) => {
          // 这里即使存在reject new promise的情况 也没有什么意义
          // 只要失败 不管你是啥 结束就ok
          if (called) return
          called = true
          reject(r)
        })
      } else {
        // 普通数组/对象 当常量抛出去即可
        resolve(x)
      }
    } catch (e) {
      if (called) return
      called = true
      reject(e)
    }
  } else {
    // 其他情况常量
    resolve(x)
  }
}

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
    // new promise 时 里面的同步函数可能会发生异常 报错
    try{
      executor(resolve, reject)
    } catch (e) {
      reject(e)
    }
  }

  // then方法会判断当前的状态
  // then方法调用后，应该返还一个新的promise
  then(onFullfilled, onRejected) {
    // 容错使用方处理数据的方法  实现可选参数  没传就给默认参数
    onFullfilled = typeof onFullfilled === 'function' ? onFullfilled : val => val
    onRejected = typeof onRejected === 'function' ? onRejected : err => { throw err }
    // 递归调用自己
    // new Promise 内部函数会立即执行 应该在返回的promise中取出上次的状态 来决定这个promise2是成功还是失败
    let promise2 = new Promise((resolve, reject) => {
      if (this.status === FULLFILLED) {
        // 当前的onFullfilled 和 onRejected 不能再当前的上下文中执行，为了确保 promise2 存在
        setTimeout(() => {
          try {
            // x可能不一定是普通值
            let x = onFullfilled(this.value)
            // 我们要拿x的值 判断promise2是成功还是失败
            resolvePromise(promise2, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        })
      }
      if (this.status === REJECTED) {
        setTimeout(() => {
          try {
            // x可能不一定是普通值
            let x = onRejected(this.reason)
            resolvePromise(promise2, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        })
      }
      // 异步 pending 时调用then   resolve 需要在 then 之后执行
      if (this.status === PENDING) {
        // ** todo
        this.onResolvedCallBacks.push(() => {
          setTimeout(() => {
            try {
              // x可能不一定是普通值
              let x  = onFullfilled(this.value)
              resolvePromise(promise2, x, resolve, reject)
            } catch (e) {
              reject(e)
            }
          })
        })
        this.onRejectedCallBacks.push(() => {
          setTimeout(() => {
            try {
              // x可能不一定是普通值
              let x = onRejected(this.reason)
              resolvePromise(promise2, x, resolve, reject)
            } catch (e) {
              reject(e)
            }
          })
        })
      }
    })
    return promise2
  }
}
Promise.deferred = function() {
  let dfd = {}
  dfd.promise = new Promise((resolve, reject) => {
    dfd.resolve = resolve
    dfd.reject = reject
  })
  return dfd
}
// 先全局安装 在测试 promises-aplus-tests 文件名
module.exports = Promise
