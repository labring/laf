---
title: 云函数处理 WebSocket 长连接
---



LaF 于 `v0.6.11` 新增支持了 WebSocket 能力。


## WebSocket 触发器
当应用收到 WebSocket 消息时，会触发以下云函数事件，开发者为任一云函数配置以下触发器，即可处理 WebSocket 消息

  - `WebSocket:connection` 有新 WebSocket 连接建立时触发，通过 `ctx.socket` 获取连接
  - `WebSocket:message` 接收 WebSocket 消息时触发，通过 `ctx.params` 获取消息数据
  - `WebSocket:close` 有 WebSocket 连接关闭时触发
  - `WebSocket:error` 有 WebSocket 连接出错时触发

以下是云函数中处理 WebSocket 示例：

```ts
exports.main = async function (ctx) {
  if (ctx.method === 'WebSocket:connection') {
    ctx.socket.send('hi connection succeed')
  }

  if (ctx.method === 'WebSocket:message') {
    const { data } = ctx.params
    console.log(data.toString())
    ctx.socket.send('I have received your message')
  }
}
```

以下是通过云函数向所有 WebSocket 连接发送消息示例：

```ts
import cloud from '@/cloud-sdk'

exports.main = async function (ctx) {
  const sockets: Set<WebSocket>= cloud.sockets
  sockets.forEach(socket => {
    socket.send('Everyone will receive this message')
  })
  return 'ok'
}
```

更多用法请参考： https://github.com/websockets/ws

## 客户端 WebSocket 连接

以下示例使用 `ws` (npm install ws) 连接 LaF WebSocket 服务，开发者亦可以使用其它 WebSocket 库:

```js
import { WebSocket } from 'ws'

const ws = new WebSocket('wss://your-own-appid.lafyun.com')
ws.on('open', (socket) => {
  console.log('connected')
  ws.send('hi')
})

ws.on('message', (data, isBinary) => {
  console.log(data.toString())
})

ws.on('close', () => {
  console.log('closed')
})
```