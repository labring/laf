---
title: 云函数处理 WebSocket 长连接
---

# {{ $frontmatter.title }}

## 特殊函数名 __websocket__

如果需要使用 WebSocket 需要创建一个云函数并且命名为 `__websocket__`，专为 WebSocket 存在的云函数！


以下是云函数中处理 WebSocket 示例：

```ts
export async function main(ctx: FunctionContext) {

  if (ctx.method === "WebSocket:connection") {
    ctx.socket.send('hi connection succeed')
  }

  if (ctx.method === 'WebSocket:message') {
    const { data } = ctx.params;
    console.log(data.toString());
    ctx.socket.send("I have received your message");
  }
}
```

更多用法请参考： <https://github.com/websockets/ws>

## 客户端 WebSocket 连接

```ts
const wss = new WebSocket("wss://your-own-appid.laf.run/__websocket__");

wss.onopen = (socket) => {
  console.log("connected");
  wss.send("hi");
};

wss.onmessage = (res) => {
  console.log("收到了新的信息......");
  console.log(res.data);
};

wss.onclose = () => {
  console.log("closed");
};
```


## 连接演示

1、替换 `__websocket__` 代码并发布

```js
import cloud from '@lafjs/cloud'

export async function main(ctx: FunctionContext) {
  // 初始化websocket user Map列表
  // 也可用数据库保存，本示例代码用的Laf云函数的全局缓存
  let wsMap = await cloud.shared.get("wsMap") // 获取wsMap
  if(!wsMap){
    wsMap = new Map()
    await cloud.shared.set("wsMap", wsMap) // 设置wsMap
  }
  // websocket 连接成功
  if (ctx.method === "WebSocket:connection") {
    const userId = generateUserId()
    wsMap = await cloud.shared.get("wsMap") // 获取wsMap
    wsMap.set(userId, ctx.socket);
    await cloud.shared.set("wsMap", wsMap) // 设置wsMap
    ctx.socket.send("连接成功,你的userID是："+userId);
  }

  // websocket 消息事件
  if (ctx.method === "WebSocket:message") {
    const { data } = ctx.params;
    console.log("接收到的信息：",data.toString());
    const userId = getKeyByValue(wsMap, ctx.socket);
    ctx.socket.send("服务端已接收到消息事件,你的userID是："+userId);
  }

  // websocket 关闭消息
  if (ctx.method === "WebSocket:close") {
    wsMap = await cloud.shared.get("wsMap") // 获取wsMap 
    const userId = getKeyByValue(wsMap, ctx.socket);
    wsMap.delete(userId);
    await cloud.shared.set("wsMap", wsMap) // 设置wsMap
    ctx.socket.send("服务端已接收到关闭事件消息,你的userID是："+userId);
  }
}
// 生成随机用户ID 
function generateUserId() {
  return Math.random().toString(36).substring(2, 15);
}

// 遍历userID
function getKeyByValue(map, value) {
  for (const [key, val] of map.entries()) {
    if (val === value) {
      return key;
    }
  }
}
```

2、获得你的WebSocket链接

一般格式为：

your-own-appid换成你的Laf应用appid

`wss://your-own-appid.laf.run/__websocket__`

3、客户端链接WebSocket链接，并获得 userID

4、新建云函数通过userID去推送消息

```js
import cloud from '@lafjs/cloud'

export async function main(ctx: FunctionContext) {
  const userID = ''
  let wsMap = await cloud.shared.get("wsMap")
  ctx.socket = wsMap.get(userID)
  ctx.socket.send("消息测试");
}
```
