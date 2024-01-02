
# 拦截器

本节介绍云函数拦截器，当请求云函数时会先执行拦截器，可以通过拦截器对云函数的请求加以控制。

::: info 本节目录
[[toc]]
:::

## 创建拦截器

拦截器也是一个云函数，创建一个云函数并且命名为 `__interceptor__` 即创建了拦截器云函数。

::: tip
`__interceptor__` 为固定命名，其它名称无效。
:::

下面是一个简单的拦截器示例，与其它云函数不同的是，拦截器云函数接受两个参数，第二个参数 `next` 为一个回调函数。

```typescript
export default async function (ctx: FunctionContext, next: Function) {
  const password = ctx.query.password
  if (password === '123456') {
    return await next(ctx)
  }

  return '禁止访问'
}
```

## 拦截指定 IP 的请求

```typescript
export default async function (ctx: FunctionContext, next: Function) {
  const ip = ctx.headers['x-forwarded-for']
  // 拦截指定的 IP 地址
  if(ip === '111.111.111.111') {
    ctx.response.status(403).send('禁止访问')
    return
  } 
  
  // 继续执行后面的云函数
  return await next(ctx)
}
```

## 拦截未认证的请求

```typescript
export default  async function (ctx: FunctionContext, next: Function) {
  if(ctx.user) {
    return await next(ctx)
  }

  ctx.response.status(403).send('禁止访问')
}
```

## 下一步
::: tip
- [HTTP 请求](./request.md)
- [HTTP 响应](./response.md)
- [HTTP 认证](./auth.md)
- [处理文件上传](./files.md)
- [发起网络请求](./fetch.md)
- [函数引用](./import.md)
:::

