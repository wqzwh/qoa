const http = require('http')
const context = require('../core/context')
const request = require('../core/request')
const response = require('../core/response')
const compose = require('../core/compose')

const _handleRequest = Symbol('_handleRequest')

module.exports = class Application {

  constructor() {
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

  callback() {
    const fn = compose(this.middleware)

    const handleRequest = (req, res) => {
      const ctx = this.createCtx(req, res)
      return this[_handleRequest](ctx, fn)
    }

    return handleRequest
  }

  createCtx(req, res) {
    const ctx = Object.create(this.context)
    const request = ctx.request = Object.create(this.request)
    const response = ctx.response = Object.create(this.response)
    context.app = request.app = response.app = this
    ctx.req = request.req = response.req = req
    ctx.res = request.res = response.res = res
    return ctx
  }

  /**
   *
   * 私有方法
   */
  [_handleRequest](ctx, fnMiddleware) {
    const res = ctx.res
    const handleResponse = () => ctx
    return fnMiddleware(ctx).then(handleResponse)
  }
}

