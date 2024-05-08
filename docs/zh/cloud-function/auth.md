

# 基于 JWT 的身份验证

关于 JWT 的介绍，可以参考文末参考链接，本节不在赘述。

::: info 本节目录
[[toc]]
:::


## 生成 JWT

```typescript
import cloud from '@lafjs/cloud'

export default async function (ctx: FunctionContext) {
  const payload = { 
    user_id: 123,
    exp: Math.floor(Date.now()/1000) + 60 * 60 * 24 * 7, // 有效期为 7 天
  }
  const token = cloud.getToken(payload)

  return token
}
```

## 验证 JWT

```typescript
import cloud from '@lafjs/cloud'

export default async function (ctx: FunctionContext) {
  const token = ctx.headers.token
  const payload = cloud.parseToken(token)

  if(payload.uid === 123) {
    return 'success'
  } else {
    return 'fail'
  }
}
```

## 开箱即用的 `Bearer Token`

::: info
Laf 云函数内置了 `Bearer Token` 的身份验证，即 `Authorization` 请求头的值为 `Bearer ${jwt}`，可直接使用。
关于 `Bearer Token` 的介绍不再赘述，需要你需要自行了解其含义用法。
:::

```typescript
import cloud from '@lafjs/cloud'

export default async function (ctx: FunctionContext) {
  const payload = ctx.user

  if(payload.uid === 123) {
    return 'success'
  } else {
    return 'fail'
  }
}
```

::: info
客户端请求时，只需在请求头中添加 `Authorization: Bearer ${jwt}` 即可，Laf 云函数会自动验证身份，并将解析后的 `payload` 存储在 `ctx.user` 中。

如果请求未携带 `Authorization` 请求头，或者 `Authorization` 请求头的值不是 `Bearer ${jwt}`，则 `ctx.user` 为 `null`。

如果 token 验证不通过， `ctx.user` 为 `null`。
:::


## 参考链接

- [JWT 中文详解](https://zhuanlan.zhihu.com/p/651660344)
- [JWT 官网](https://jwt.io/)


## 下一步
::: tip
- [HTTP 请求](./request.md)
- [HTTP 响应](./response.md)
- [处理文件上传](./files.md)
- [发起网络请求](./fetch.md)
- [云数据库](../cloud-database/index.md)
:::
