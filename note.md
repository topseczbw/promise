# promise

2019/10/05 15:43

<!-- TOC -->

- [promise 是什么](#promise-是什么)
- [promise 存在的价值](#promise-存在的价值)
- [promise 特点](#promise-特点)
- [如何手写一个简版 promise](#如何手写一个简版-promise)
  - [既然promise是一个构造函数/类，那么它new时可以传递哪些参数，这些参数又是做什么用的](#既然promise是一个构造函数类那么它new时可以传递哪些参数这些参数又是做什么用的)
  - [为了实现上述功能，每个promise实例应该具有哪些内部状态](#为了实现上述功能每个promise实例应该具有哪些内部状态)
  - [当executor同步：2 > 1 ? resolve('回答正确') : throw new Error('原则性错误')](#当executor同步2--1--resolve回答正确--throw-new-error原则性错误)
  - [当executor异步：setTimeOut(() => resolve('async'), 2000)](#当executor异步settimeout--resolveasync-2000)
- [链式调用 （最复杂的一部分）](#链式调用-最复杂的一部分)
- [then中的可选参数   第一个错误没处理 错误 穿透](#then中的可选参数---第一个错误没处理-错误-穿透)
- [处理resolve() 中的值  如果是 一个 promise （不在规范中）](#处理resolve-中的值--如果是-一个-promise-不在规范中)
- [catch （不在规范中）](#catch-不在规范中)
- [promise 其他应用](#promise-其他应用)
  - [promise.finally](#promisefinally)
  - [Promise.try() 用来捕获异常的  可以捕获同步/异步异常](#promisetry-用来捕获异常的--可以捕获同步异步异常)
  - [Promise.resolve()  ===](#promiseresolve--)
  - [Promise.reject()](#promisereject)
  - [Promise.all()](#promiseall)
  - [Promise.race() 有一个成功就算成功](#promiserace-有一个成功就算成功)
- [$$zbw$$](#zbw)
- [A+ 规范](#a-规范)
- [generactor](#generactor)
- [async](#async)

<!-- /TOC -->

## promise 是什么

promise是一个构造函数/类

## promise 存在的价值

解决并发问题，多个异步任务的执行结果

解决链式问题，第二个接口依赖于第一个接口，解决回调地狱问题

## promise 特点

1. 每次new一个promise实例时，都需要传递一个执行器函数executor，并且执行器函数会立即执行

2. 执行器函数有两个参数 resolve reject
3. 每个promise都有一个状态标识，有三种状态类型：

   pending => resolve 成功了

   pending => reject 失败了

4. 状态可以改变，一旦改变不可以再次更改

   一旦成功了，不能再变成失败，一旦失败了，不能再变成成功
    （什么时候可以改变状态呢？ ）

5. 如果执行器函数在执行时，抛出异常如 `throw new Error('自定义错误')` ，那promise应该变成失败状态，会被.then时的 `onRejected` 处理错误的函数接收

## 如何手写一个简版 promise

### 既然promise是一个构造函数/类，那么它new时可以传递哪些参数，这些参数又是做什么用的

executor、resolve、reject

executor执行业务逻辑（同步/异步），在适当的时机调用，resolve/reject。

如数据成功返回时，调用resolve函数，将promise实例变成成功态，并将数据告诉promise实例，promise实例拿到数据后，先暂存起来，当promise实例被手动调用.then方法时，供then方法第一个处理成功信息的函数nFullfilled使用

如数据返回失败/代码报错时，调用reject函数，将promise实例变成失败态，并将失败原因告诉promise实例，promise实例拿到失败原因后，先暂存起来，当promise实例被手动调用.then方法时，供then方法第二个处理失败信息的函数onRejected使用

### 为了实现上述功能，每个promise实例应该具有哪些内部状态

1. 用户手动调用的resolve、reject函数不需要自己声明变量，所以调用的应该是new Promise() 时， Promise函数内部作用域的变量 => constructor 中的resolve和 reject
2. resolve函数可以改变promise状态，每个promise都有一个状态标识，标识当前状态 => this.status
3. 当resolve(data) / reject(reason)时，promise需要暂存外部告知的**数据**或**失败原因**，并且当外部手动调用then时，还需要用到 => this.value  this.reason
4. promise实例可以被手动调用then方法，处理成功时的数据或失败时的原因 => this.then()

### 当executor同步：2 > 1 ? resolve('回答正确') : throw new Error('原则性错误')

由于executor函数会立即执行，所以如果该函数都是同步逻辑，promise状态会立即改变，数据会立即暂存，所以后面.then时，可以立即处理对应的数据。

### 当executor异步：setTimeOut(() => resolve('async'), 2000)

但是当executor函数中有异步逻辑时，resolve函数不会马上执行，但是.then会在 new Promise 后马上执行。但此时promise还处于pending状态，所以我们需要在原型的then方法中，当状态是pending时，先将用户传来的处理数据/异常的方法暂存进一个队列，当调用resolve/reject，在从队列中遍历执行处理方法。此处使用发布订阅模式。

故promise增加onResolvedCallBacks、onRejectedCallBacks两个数组实例属性，暂存处理函数。

## 链式调用 （最复杂的一部分）

(处理then中的return的返回值规则)

1. 如果then方法中返回普通值（包括undefined）  不是promise 也不是 错误， 会传给外层的then
2. 那如果**想让下一个then**中走失败   那只能 返回一个失败的promise  return Promise.reject(111111)  或者 抛出一个异常 throw 11 ??
3. 如果返回的是一个promise 那么这个promise 会执行  并且采用他的状态 把他的结果 传给外层  如果成功就是成功数据  失败传失败的数据
4. 如果抛出错误会走下一个 then的失败方法

---
可以由失败变成成功  在失败的promise后面  再then  即使return undefined 也会走入下一个then

如果promise失败了  但是第一个then没有捕获  会继续往下走 在下面 外层的 then中捕获  如果第一个then捕获了 会走第一个

then（）后虽然可以执行.then  但是返回的不是之前的promise实例， 因为先前的promise实例状态已经不能再改变了  返回的是一个新的promise

如果不想往下走了 就 return new Promise()

 new Promise 内部函数会立即执行 应该在返回的promise中取出上次的状态 来决定这个promise2是成功还是失败

自己的then 第一个函数中 抛错 不能再自己 err 回调中捕获 只能在下一个

then中的成功、 失败方法 可能会返回一个promise  普通值(undefined)  error

x的值会决定下 个promise2  会走成功还是失败  我们要拿x的值 判断promise2是成功还是失败

resolvePromise(promise2, x, resolve, reject)  把promise2 的  resolve  reject 也穿过去

new的过程中 promise2 有值吗 ？  没有 undefined

// 当前的onFullfilled 和 onRejected 不能再当前的上下文中执行，为了确保 promise2 存在

return 的时候 除了处理了自己的promise  还有可能处理别人的promise  所以要严谨resolvePromise    就是说 返回的promise 也是分几种类型的   有别人写的 有自己的  还可能使自己(死循环) TypeError

resolve 中可能还会返回 promise  y  递归解析

## then中的可选参数   第一个错误没处理 错误 穿透

第一个then中的 错误处理  到下一个 可能变成正确的

## 处理resolve() 中的值  如果是 一个 promise （不在规范中）

```js
let p = new Promise((resolve, reject) => {
  resolve(new Promise((resolve1, reject1) => {
    setTimeout(() => {
      resolve1('hello')
    }, 1000)
  }))
})
p.then(data => {
  console.log(data)
})
```

## catch （不在规范中）

上一个then中如果报错， 会走到下一个catch中

catch后可以继续then

catch就是then的一个别名  语法糖 让我们少写一个 成功的回调

## promise 其他应用

### promise.finally

最终无论如何都执行，如果返回一个promise，会等待这个promise执行完成

promise.finally 后可以继续then

### Promise.try() 用来捕获异常的  可以捕获同步/异步异常

### Promise.resolve()  ===

### Promise.reject()

### Promise.all()

理多个异步并发的问题， 全部完成才算完成 有一个失败就算失败,

then中返回的数据  是按照顺序执行的

为了防止数据类表中 前两个是异步 第三个是常量  所以不可以用 arr.length === promises.length 判断是否都执行完毕

### Promise.race() 有一个成功就算成功

## $$zbw$$

是为了解决以前处理异步时出现回调地狱的情况，我们不想再用回调函数了，希望更优雅地处理异步问题，才使用promise，所以promise只是一种处理异步的解决方案，并不是新的东西。

既然promise可以处理异步，那肯定可以处理同步，先写同步

如何证明 resolve reject 是在内部声明的   首先没有在外部声明  而且在executor 执行器函数中 又被调用  所以这个只能在 promise 构造函数的作用域内        这两个函数的作用  只是为了在promise被改变状态的时候**传递数据 工具函数 **  每次**new promise 的时候  都会有一个 resolve  和 reject  **所以这两个参数函数  是跟着promise走的工具函数  又不需要外部声明

每个promise 都会有一个变量标识当然处于什么状态，供 then方法使用

value 值调用resolve时需要先存起来  并且 then的时候还要用  所以这个value值只能放在实例上

如果抛错也会当成reject

同步代码可以使用try catch

resolve 和 reject 可以外部调用  也可以内部调用

用户规定一个promise 什么时候算成功， 什么时候算失败
然后用户写 成功时候的处理函数  失败时候的函数
而promise做的就是  当复合用户规定的成功条件时， 把值存起来   当用户调用then时， 把值告诉用户
至于then函数里面的参数  是 用户传了两个函数 为了获取成功 、失败时的数据

promise实例 都是 thenable 对象  能then的就是promise实例

## A+ 规范

[promise A+](https://promisesaplus.com/)

## generactor

## async

async函数返回的是promise

捕获异常
