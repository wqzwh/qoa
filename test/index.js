const Qoa = require('../core/application')

const app = new Qoa()

app.use(async (ctx, next) => {
  ctx.body = '1'
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

app.listen(3000, () => {
  console.log('server start port 3000')
})