## 介绍

简单实现koa基本功能，仅供学习参考，了解koa的核心思想以及实现过程。

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
- [x] request
- [x] middleware

### use
实现`use`API其实就是将定义的方法发`push`进入定义的中间件数组变量`middleware`中，核心代码如下：
```js
use(cb) {
  this.middleware.push(cb)
}
```

### listen
主要是调用了node原生API中的`http.createServer()`方法，在这会运行两个方法，基本如下：

1、创建`ctx`
2、定义`fn`变量，保存`use`中的`push`进去的方法，
3、运行所有的`fn`中的方法，同时通过定义的`next`来触发`fn`中下一个中间件方法
```js
const server = http.createServer(async (req, res) => {
  const ctx = this.createCtx(req, res)
  const fn = compose(this.middleware)
  await fn(ctx)
  ctx.res.end(ctx.body)
})
return server.listen(...args)
```

### callback
之前定义的`listen`中，使用`http.createServer()`起的端口服务，如果需要定义多个端口，或者定义`https`的话，你就可以使用`callback`这个API，并且将之前定义的中间件方法再次运行一次，然后挂在到新定义的服务上，代码如下：
```js
const fn = compose(this.middleware)
  const handleRequest = (req, res) => {
    const ctx = this.createCtx(req, res)
    return this[_handleRequest](ctx, fn)
  }
  return handleRequest
```
> 定义`this[_handleRequest]`主要是为了使用`私有方法`，这样外部就能被访问。

### keys
这个主要是为了设置签名的 Cookie 密钥使用的，跟koa2实现基本一致，片段代码如下：
```js
// context.js
get cookies() {
  if (!this[COOKIES]) {
    this[COOKIES] = new Cookies(this.req, this.res, {
      keys: this.app.keys
    });
  }
  return this[COOKIES];
},

set cookies(_cookies) {
  this[COOKIES] = _cookies;
}
```
context.js中能获取到this.app上定义的属性，主要是因为在`application.js`中创建上下文的时候将`this`赋值给当前`context`、`request`、`response`的`app`，片段代码如下：
```js
// application.js
context.app = request.app = response.app = this
```

### context
这里并没有实现完整的`context`代码，主要是使用了`get set`来定义方法，这样能监听对上下文的改变，并没有按照koa实现完整逻辑，只是为了实现基本流程，完整代码如下：
```js
// context.js
const Cookies = require('cookies');
const COOKIES = Symbol('context#cookies');

module.exports = {
  get url() {
    return this.request.url
  },
  get body() {
    return this.response.body
  },
  set body(val) {
    this.response.body = val
  },
  get cookies() {
    if (!this[COOKIES]) {
      this[COOKIES] = new Cookies(this.req, this.res, {
        keys: this.app.keys
      });
    }
    return this[COOKIES];
  },
  set cookies(_cookies) {
    this[COOKIES] = _cookies;
  }
}
```

### response和request
为了实现基本流程，所以代码并不复杂，基本如下：
```js
// response.js
module.exports = {
  get body() {
    return this._body
  },

  set body(val) {
    this._body = val
  }
}
```
```js
// request.js
module.exports = {
  get url() {
    return this.req.url
  }
}
```

### middleware
koa2的中间件其实就是洋葱结构，从上往下一层一层进来，再从下往上一层一层回去。实现简易版的中间件机制，完整代码如下：
```js
// compose.js
function compose(middleware) {
  return (context) => {
    // 第一次出发use中的中间件的函数内容
    return dispatch(0)
    function dispatch(i) {
      let fn = middleware[i]
      if(!fn) return Promise.resolve()
      return Promise.resolve(fn(context, next => {
        // 这里的next就是外层use中间件传入的next，用来确定执行下一个中间件的标记
        return dispatch(i + 1)
      }))
    }
  }
}

module.exports = compose
```

这个得结合示例代码以及`application.js`中的方法来读懂`compose`方法，以下是`application.js`中的`use`、`listen`、`createCtx`三个方法：
```js
module.exports = class Application {
  // 省略
  use(cb) {
    this.middleware.push(cb)
  }

  listen(...args) {
    const server = http.createServer(async (req, res) => {
      const ctx = this.createCtx(req, res)
      const fn = compose(this.middleware)
      await fn(ctx) // 将上下文ctx传入compose.js中的compose方法中return出来的函数
      ctx.res.end(ctx.body)
    })
    return server.listen(...args)
  }

  createCtx(req, res) {
    const ctx = Object.create(this.context)
    const request = ctx.request = Object.create(this.request)
    const response = ctx.response = Object.create(this.response)
    ctx.app = request.app = response.app = this
    ctx.req = request.req = response.req = req
    ctx.res = request.res = response.res = res
    return ctx
  }
  // 省略
}
```

根据demo测试代码，你会发现最后浏览器预览输出的结果是`123654`，`123`好理解，根据上面的源码，发现use只是个同步代码，只有在触发`next`时会触发`compose`中的`dispatch`方法，继续执行下一个异步中间件逻辑操作，因此会接着拼出`654`，至于为什么不是`123456`可以查看关于[node环境下的事件循环机制](http://www.iwangqi.com/2018-11-20-EventLoop/#Node%E7%8E%AF%E5%A2%83%E4%B8%8B%E7%9A%84%E4%BA%8B%E4%BB%B6%E5%BE%AA%E7%8E%AF)

### 再谈上下文
这里主要看看入口文件，对于上下文到底做了什么，片段代码如下：
```js
// application.js
// 省略
module.exports = class Application {
  // 省略
  createCtx(req, res) {
    const ctx = Object.create(this.context)
    const request = ctx.request = Object.create(this.request)
    const response = ctx.response = Object.create(this.response)
    ctx.app = request.app = response.app = this
    ctx.req = request.req = response.req = req
    ctx.res = request.res = response.res = res
    return ctx
  }
  // 省略
}
```
这里需要解释下，`ctx.req`、`ctx.res`、`ctx.app`、`request.res`、`response.req`：

* request - request继承于Request.js静态类，包含操作request的一些常用方法
* response - response继承于Response.js静态类，包含操作response的一些常用方法
* req - nodejs原生的request对象
* res - nodejs原生的response对象
* app - koa的原型对象

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
