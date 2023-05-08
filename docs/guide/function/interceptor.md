---
title: 云函数拦截器
---

# {{ $frontmatter.title }}

如果需要使用拦截器，需要创建一个云函数并且命名为 `__interceptor__`的云函数。

::: info
`__interceptor__` 为固定命名
:::

Laf 云函数拦截器，是在所有的云函数请求之前被请求，故而也可以叫做前置拦截器。

只有拦截器的返回值为 `true` ，才会去请求的原本的云函数

下面是一个简单的拦截器示例，如果 IP 是`111.111.111.111`，则可以继续访问原本的云函数

```typescript
export async function main(ctx: FunctionContext) {
  // 获取请求的实际 IP
  const ip = ctx.headers['x-real-ip']
  if(ip == '111.111.111.111'){
    return true
  }else{
    return false
  }
}
```

更多用途可自由发挥！
