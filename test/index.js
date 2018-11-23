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
// https.createServer(app.callback()).listen(443, () => {
//   console.log('开启443端口')
// });
