---
title: Application Initialization
---



# {{ $frontmatter.title }}

After restarting, Laf application can perform initialization operations in a cloud function, such as database initialization and global cache initialization.

:::tip
The cloud function for application initialization has a fixed name: `__init__`, other names will not take effect.
:::

Here is a simple example of an application initialization cloud function that records the startup time when the Laf application starts:

```typescript
import cloud from '@lafjs/cloud'

export async function main(ctx: FunctionContext) {
  // Record the startup time of the Laf application
  const db = cloud.database()
  await db.collection('init').add({
    time: Date.now()
  })
}
```