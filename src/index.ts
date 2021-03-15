import express = require('express')
import { parseToken } from './lib/token'
import AdminEntry from './entry/admin'
import AppEntry from './entry/app'
import { AdminRouter, UserRouter, FileRouter } from './router'

const app = express()
app.use(express.json())


// 服务端开放跨域
app.all('*', function (_req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Authorization, Content-Type')
  res.header('Access-Control-Allow-Methods', '*')
  next()
})

// 解析 Bearer Token
app.use(function (req, _res, next) {
  const bearer = req.headers['authorization'] ?? ''
  const splitted = bearer.split(' ')
  const token = splitted.length === 2 ? splitted[1] : ''
  const auth = parseToken(token) || null
  req['auth'] = auth
  next()
})

app.use('/admin', AdminEntry)
app.use('/app', AppEntry)

app.use('/admin', AdminRouter)
app.use('/user', UserRouter)
app.use('/file', FileRouter)

const port = process.env.PORT ?? 8080
app.listen(port, () => console.log(`listened on ${port}`))