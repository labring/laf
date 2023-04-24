---
title: 云函数历史日志
---

# {{ $frontmatter.title }}

云函数的全部历史日志，全部都自动保存到了日志板块中，日志会保留7天

可根据请求ID `requestId` 和云函数名筛选

![function-log](/doc-images/function-log.png)

1、点击日志，切换到日志板块

2、可根据 `requestId` 和云函数名搜索指定日志

3、点击单个日志，可查看详细内容

## 手动清理日志

Laf云函数的运行日志都在一个隐藏的集合中：`__function_logs__`

所以我们可以通过云函数操作数据库的方法，清理日志

以下是清理全部日志的云函数写法：

::: danger
以下操作会删除全部历史日志，请谨慎操作
:::

```typescript
import cloud from '@lafjs/cloud'

export async function main(ctx: FunctionContext) {
  console.log('Hello World')
  // 数据库,删除全部日志
  const db = cloud.database();
  const res = await db.collection('__function_logs__').remove({multi:true})
  console.log(res)
}
```
