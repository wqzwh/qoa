## 介绍

简单实现koa基本功能，仅供学习参考，了解koa的核心思想以及实现过程

## 环境要求

依赖 node v7.6.0 或 ES2015及更高版本和 async 方法支持。

## 实现功能

主要依据`koa`官网介绍，实现简易核心功能，基本实现以下几个功能

- [x] use
- [x] listen
- [x] callback
- [x] keys
- [x] context 上下文
- [x] response
- [x] Request
- [x] Middleware
- [x] next

## demo测试

运行`test`文件夹下的js文件即可，基本实现以上几个简易的功能，测试代码如下：
```js
const Qoa = require('../core/application')
const http = require('http')
const https = require('https')

const app = new Qoa()

app.use(async (ctx, next) => {
  ctx.body = '1'
  ctx.cookies.set('name', 'tobi', { signed: true })
  await next()
  ctx.body += '4'
})

app.use(async (ctx, next) => {
  ctx.body += '2'
  await next()
  ctx.body += '5'
})

app.use(async (ctx, next) => {
  ctx.body += '3'
  await next()
  ctx.body += '6'
})

app.keys = ['im a newer secret', 'i like turtle']

app.listen(3000, () => {
  console.log('server start port 3000')
})

http.createServer(app.callback()).listen(1234, () => {
  console.log('开启1234端口')
});
https.createServer(app.callback()).listen(443, () => {
  console.log('开启443端口')
});
```

## 总结Koa相关api介绍

<img src="https://github.com/wqzwh/qoa/raw/master/doc/koa2.png?raw=true" style="max-width:100%;">
