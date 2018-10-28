const http = require('http')
const context = require('../core/context')
const request = require('../core/request')
const response = require('../core/response')
const compose = require('../core/compose')

module.exports = class Application {

  constructor() {
    this.callback = null
    this.middleware = []
    this.context = Object.create(context)
    this.request = Object.create(request)
    this.response = Object.create(response)
  }

  use(cb) {
    this.middleware.push(cb)
  }

  listen(...args) {
    const server = http.createServer(async (req, res) => {
      const ctx = this.createCtx(req, res)
      const fn = compose(this.middleware)
      await fn(ctx)
      ctx.res.end(ctx.body)
    })
    return server.listen(...args)
  }

  createCtx(req, res) {
    const ctx = Object.create(this.context)
    const request = ctx.request = Object.create(this.request)
    const response = ctx.response = Object.create(this.response)
    ctx.req = request.req = response.req = req
    ctx.res = request.res = response.res = res
    return ctx
  }
}

