---
title: 云函数拦截器
---

# {{ $frontmatter.title }}

如果需要使用拦截器，需要创建一个云函数并且命名为 `__interceptor__`的云函数。

::: tip
`__interceptor__` 为固定命名，其他名称无效
:::

Laf 云函数拦截器，是在所有的云函数请求之前被请求，故而也可以叫做前置拦截器。

只有拦截器的返回值为 `true` ，才会去请求的原本的云函数

下面是一个简单的拦截器示例，如果 IP 是`111.111.111.111`，则可以继续访问原本的云函数

```typescript
export default async function(ctx: FunctionContext) {
  // 获取请求的实际 IP
  const ip = ctx.headers['x-forwarded-for']
  if(ip === '111.111.111.111'){
    return true
  }else{
    return false
  }
}
```

## 新版写法

```typescript
import cloud from '@lafjs/cloud'

export default async function (ctx: FunctionContext, next) {
  let res = null

  // 拦截逻辑
  // ...
  // 返回错误信息
  //  return {
  //   code: 400,
  //   data: e.message
  // }

  // 请求实际云函数
  res = await next(ctx)
  return {
    code: 200,
    data: res
  }
}

// 兼容旧版写法

// import cloud from '@lafjs/cloud'

// export default async function (ctx: FunctionContext) {
//    return true
// }
```
