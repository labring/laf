---
title: 云函数处理 WebSocket 长连接
---

# {{ $frontmatter.title }}

## 特殊函数名 __websocket__ 
如果需要使用 WebSocket 需要创建一个云函数并且命名为 `__websocket__`，这个云函数并不会运行之后销毁，会一直存在，专为 WebSocket 存在的云函数！   

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

更多用法请参考： https://github.com/websockets/ws

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