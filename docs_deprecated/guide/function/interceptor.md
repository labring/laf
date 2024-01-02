---
title: 云函数拦截器
---

# {{ $frontmatter.title }}

如果需要使用拦截器，需要创建一个云函数并且命名为 `__interceptor__`的云函数。

::: tip
`__interceptor__` 为固定命名，其他名称无效
:::

Laf 云函数拦截器，是在所有的云函数请求之前被请求。


下面是一个简单的拦截器示例，如果 IP 是 `111.111.111.111` ，则不允许其访问云函数。


```typescript
import cloud from '@lafjs/cloud'

export default async function (ctx: FunctionContext, next: Function) {
  const ip = ctx.headers['x-forwarded-for']
  if(ip === '111.111.111.111') {
    ctx.response.status(403).send('Permission Denied')
    return
  } 
  
  // 继续执行云函数
  return await next(ctx)
}
```


<br />

### 旧版写法

::: danger
DEPRECATED: 旧版用法已废弃，不推荐使用，仅作为兼容旧版的云函数。
:::


```typescript
export default async function(ctx: FunctionContext) {
  const ip = ctx.headers['x-forwarded-for']
  if(ip === '111.111.111.111'){
    return true
  }else{
    return false
  }
}
```

> 旧版本写法无需使用 `next` 参数，直接返回 `true` 或 `false` 分别表示是否继续执行云函数。
