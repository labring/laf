
# 云函数处理 WebSocket 连接

本节介绍使用云函数处理 WebSocket 连接。

## 创建 WebSocket 云函数

创建一个固定命名为 `__websocket__` 的云函数，该云函数专用于处理 WebSocket 连接。

::: tip
WebSocket 云函数名为固定云函数名：`__websocket__`，其他名称均不会生效
:::

以下是处理 WebSocket 的示例代码：

```typescript
export async function main(ctx: FunctionContext) {

  if (ctx.method === "WebSocket:connection") {
    ctx.socket.send('hi connection succeed')
  }

  if (ctx.method === 'WebSocket:message') {
    const { data } = ctx.params
    console.log(data.toString())
    ctx.socket.send("I have received your message");
  }

  if (ctx.method === 'WebSocket:error') {
    const error = ctx.params
    console.log(error)
  }

  if (ctx.method === 'WebSocket:close') {
    const { code, reason } = ctx.params
    console.log(code, reason)
  }
}
```

### 客户端连接

```typescript
const wss = new WebSocket("wss://your-own-appid.laf.run")

wss.onopen = (socket) => {
  console.log("connected")
  wss.send("hi")
};

wss.onmessage = (res) => {
  console.log("收到了新的信息......");
  console.log(res.data);
};

wss.onclose = () => {
  console.log("closed");
}
```

## 下一步
::: tip
- [HTTP 请求](./request.md)
- [HTTP 响应](./response.md)
- [HTTP 认证](./auth.md)
- [处理文件上传](./files.md)
- [发起网络请求](./fetch.md)
- [云数据库](../cloud-database/index.md)
- [云存储](../cloud-storage/index.md)
:::
