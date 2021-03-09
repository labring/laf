import express = require('express')


const app = express()
app.use(express.json())


// 服务端开放跨域
app.all('*', function (_req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Authorization, Content-Type')
  res.header('Access-Control-Allow-Methods', '*')
  res.header('Content-Type', 'application/json;charset=utf-8')
  next()
})

app.post('/admin', require('./entry/admin'))
app.post('/app', require('./entry/app'))


const port = process.env.PORT ?? 8080
app.listen(port, () => console.log(`listened on ${port}`))