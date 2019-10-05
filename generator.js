/*
 * @Author: zbw
 * @Date: 2019-10-05 12:45
 */

//
// function * read() {
//   yield 1;
//   yield 2;
//   yield 3;
// }
// let it = read()
// // { value: 1, done: false}
// console.log(it.next())
// // { value: 2, done: false}
// console.log(it.next())
// // { value: 3, done: false}
// console.log(it.next())
// // { value: 3, done: true}
// console.log(it.next())

// 将类数组转化成数组
// 类数组定义：1索引 2长度
// 想用 ... for of 都必须要给当前对象 提供一个生成器方法

// const a = {
//   0: 1,
//   1: 2,
//   length: 2
// }
// TypeError: a is not iterable
// console.log([...a])

const a = {
  0: 1,
  1: 2,
  2: 3,
  length: 3,
  [Symbol.iterator]() {
    let len = this.length
    let index = 0
    // 返回一个迭代器对象
    return {
      next: () => {
        return {
          value: this[index++],
          done: index === len + 1
        }
      }
    }
  }
}
console.log([...a])

// 用生成器去写

const b = {
  0: 1,
  1: 2,
  2: 3,
  length: 3,
  // generactor 生成器方法执行后 返回一个迭代器对象
  [Symbol.iterator]: function * () {
    let index = 0
    while(index !== this.length) {
      yield this[index++]
    }
  }
}
console.log([...b])

// ... 和 Array.from 区别

// ...会调[Symbol.iterator]方法  对象没有这个方法  所以不会被迭代
// Array.from 只是做了个循环 把结果方进入

// next传参和 yield返回值

const fs = require('fs').promise
function * read() {
  let content = yield fs.readFile('name.txt', 'utf8')
  let age = yield fs.readFile(content, 'utf8')
  return age
}

let it = read()
it.next().value.then(data => {
  it.next(data).value.then(data => {
    let r = it.next(data)
    console.log(r.value)
  })
})
