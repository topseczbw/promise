// const Promise = require('./promise')

// ————————————————————————————————————————————————————1
// const p1 = new Promise((resolve, reject) => {
//   setTimeout(() => {
//     resolve('成功')
//   },2000)
//   reject('失败')
//   throw new Error('失败了！！！')
// })

// p1.then(data => {
//   console.log('进入成功态')
//   console.log(data)
// }, err => {
//   console.log('进入拒绝态')
//   console.log(err)
// })
//
// p1.then(data => {
//   console.log('进入成功态')
//   console.log(data)
// }, err => {
//   console.log('进入拒绝态')
//   console.log(err)
// })
//
// p1.then(data => {
//   console.log('进入成功态')
//   console.log(data)
// }, err => {
//   console.log('进入拒绝态')
//   console.log(err)
// })

// ————————————————————————————————————————————————————1








// ————————————————————————————————————————————————————2
// let fs = require('fs')
// 原生的方法 错误都需要自己控制
// fs.readFile('name.txt', 'utf8', (err, data) => {
//   if (err) {
//     return
//   }
//   fs.readFile(data.trim(), 'utf8', (err, age) => {
//     if (err) {
//       return
//     }
//     console.log(age)
//   })
// })

// function readFile(...args) {
//   return new Promise((resolve, reject) => {
//     fs.readFile(...args, 'utf8', function (err, data) {
//       if (err) reject(err)
//       resolve(data)
//     })
//   })
// }
// readFile('name.txt').then(data => {
//   return readFile(data.trim())
//   return data
//   return false
//   throw new Error('失败信息11111')
//   return Promise.reject(111111)
//   return new Promise((resolve, reject) => {
//     reject('成功信息2222')
//   })
//   return new Promise((resolve, reject) => {
//     resolve('成功信息2222')
//   })
// }).then(data => {
//   console.log('成功')
//   console.log(data)
// }, err => {
//   console.log('失败')
//   console.log(err)
// }).then(data => {
//   console.log('成功')
//   console.log(data)
// }, err => {
//   console.log('失败')
//   console.log(err)
// })
// ————————————————————————————————————————————————————2



// ————————————————————————————————————————————————————3
// let p = new Promise((resolve, reject) => {
//   resolve('hello')
//   return p
// })

// let promise2 = p.then(data => {
//   console.log(p)
//   return data
//   return 111
//   return new Promise((resolve, reject) => {
//     setTimeout(() => {
//       resolve('world')
//     }, 1000)
//   })
//   return p
//   return new Promise((resolve, reject) => {
//       setTimeout(() => {
//         resolve(new Promise((resolve, reject) => {
//           setTimeout(() => {
//             resolve('hello11')
//           }, 1000)
//         }))
//       }, 1000)
//   })
// })
//
// promise2.then(data => {
//   console.log('成功')
//   console.log(data)
// }, err => {
//   console.log('失败')
//   console.log(err)
// })
// ————————————————————————————————————————————————————3


// ————————————————————————————————————————————————————4
// let p = new Promise((resolve, reject) => {
//   setTimeout(() => {
//     reject('hello')
//   }, 1000)
// })
// p.then(123, err => {
//   console.log(err)
// })
// ————————————————————————————————————————————————————4


// ————————————————————————————————————————————————————5
// let p = new Promise((resolve, reject) => {
//   resolve(new Promise((resolve1, reject1) => {
//     setTimeout(() => {
//       reject('error')
//     }, 1000)
//   }))
// })

let p = Promise.resolve('zbw')
p.then(data => {
  // console.log(data)
  return data
}).finally(() => {
  console.log('finally')
}).then(data => {
  console.log(data)
}, err => {
  console.log(err)
})


// ————————————————————————————————————————————————————5
