
# 用于应用初始化的云函数

本节介绍一个特殊的云函数，它会在应用启动时自动执行一次。

::: info 本节目录
[[toc]]
:::


## 创建初始化云函数

创建一个云函数并且命名为 `__init__` 即可，当应用实例启动时，会自动执行该云函数。

::: tip
- 应用启动、重启皆会触发该云函数的执行。
- 若应用有多个实例，则启动时会触发多次执行，即每个应用实例启动时都会触发初始化函数的执行。
:::

下面的代码展示在应用启动时初始化一个管理员：

```typescript
import cloud from '@lafjs/cloud'

export default async function (ctx: FunctionContext) {
  const db = cloud.mongo.db
  const admin = await db.collection('admin').findOne()

  if(!admin) {
    await db.collection('admin').insertOne({
      username: 'admin',
      password: 'abc123',
      createdAt: new Date()
    })
  }
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

