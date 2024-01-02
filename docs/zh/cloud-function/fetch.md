

# 在云函数中发起网络请求

本节介绍在云函数中发起 HTTP 请求。

::: info 本节目录
[[toc]]
:::

[Fetch API](https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API) 提供了一个全局 fetch() 方法，该方法提供了一种简单的方式来跨网络异步获取资源。


## 发起 GET 请求

### 获取 JSON 数据

```typescript
export default async function (ctx: FunctionContext) {
  const res = await fetch('https://api.github.com/users/maslow')
  const obj = await res.json()
  return obj
}
```

### 获取文本类型数据

```typescript
export default async function (ctx: FunctionContext) {
  const res = await fetch('http://www.baidu.com/')
  const html = await res.text()
  return html
}
```

### 下载文件并上传到云存储
::: tip
本例演示使用 `fetch()` 方法下载网络图片，并保存到云存储中，需要你提前在 laf 控制台创建一个文件桶，本例中文件桶名假定为 `data`。
:::

```typescript
import cloud from '@lafjs/cloud'

export default async function (ctx: FunctionContext) {
  // 下载图片
  const imgUrl = 'https://laf.run/logo_text.png'
  const res = await fetch(imgUrl)
  const imageBuffer = Buffer.from(await res.arrayBuffer())

  // 上传到云存储
  const bucket = cloud.storage.bucket('data')
  await bucket.writeFile('test.png', imageBuffer, {
    ContentType: res.headers.get('content-type')
  })

  return 'ok'
}
```

::: info 更多参考
操作云存储的详细用法，请参考[云存储上传文件](../cloud-storage/upload.md)。
:::


## 发起 POST 请求

### 提交 JSON 数据

```typescript
export default async function (ctx: FunctionContext) {
  const url = 'https://laf.run/v1/auth/passwd/signin'
  const user =  { 
    username:  'laf-user',
    password:  'your-laf-run-password'
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    }, 
    body: JSON.stringify(user) 
  })

  const token = await res.json()
  return token
}
```


::: tip 更多参考

可查看 Fetch API 中文详细教程 [《阮一峰的网络日志 - Fetch API 教程》](https://www.ruanyifeng.com/blog/2020/12/fetch-tutorial.html)。
:::

## 下一步
::: tip
- [HTTP 请求](./request.md)
- [HTTP 响应](./response.md)
- [HTTP 认证](./auth.md)
- [处理文件上传](./files.md)
- [函数引用](./import.md)
- [云存储](../cloud-storage/index.md)
:::

