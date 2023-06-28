---
title: 应用初始化
---

# {{ $frontmatter.title }}

Laf 应用在重新启动后，可以在一个云函数中执行初始化操作，如数据库的初始化，全局缓存的初始化等。

:::tip
应用初始化云函数名为固定云函数名：`__init__`，其他名称均不会生效
:::

下面是一个简单的应用初始化云函数例子，在 Laf 应用启动时记录启动时间

```typescript
import cloud from '@lafjs/cloud'

export async function main(ctx: FunctionContext) {
  // 记录 Laf 应用启动时间
  const db = cloud.database()
  await db.collection('init').add({
    time: Date.now()
  })
}
```
