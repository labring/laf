

> cloud-sdk 是用于云函数中，做为云函数的 SDK 使用，暴露 less-framework 中的一些资源对象。

在云函数中使用示例：

```ts
import cloud from '@/cloud-sdk'

exports.main = async function (ctx) {

  const db = cloud.database()
  const res = await db.collection('admins').get()

  return res.data
}
```