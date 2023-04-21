---
title: 在云函数中调用
---

# {{ $frontmatter.title }}

云函数在开发完毕并发布后，可以在其他云函数中进行调用。

::: info
`cloud.invoke`方法已不推荐使用，可使用[引入云函数](/guide/function/use-function.html#云函数引入)
:::

## 编写并发布待调用云函数

比如，我们创建一个名为 `get-user-info` 的云函数，并编写如下代码:

```typescript
import cloud from '@lafjs/cloud'

const db = cloud.database()

export async function main(ctx: FunctionContext) {
  
  const { body: { userid } } = ctx
  if (!userid) return { err: 1, errmsg: 'userid not exists' }

  const userCollection = db.collection('user')
  const { data: user } = await userCollection.where({ id: userid }).get()

  if (!user) return { err: 2, errmsg: 'user not found' }
  return { err: 0, data: user }
}
```

该函数接收一个名为 userid 的参数, 并通过id在数据库中查找相应用户，并将 查找到的数据返回。

## 调用已发布云函数

`get-user-info` 云函数发布后， 我们可以在其他云函数调用该函数。

```typescript
import cloud from '@lafjs/cloud'

export async function main(ctx: FunctionContext) {
  const res = await cloud.invoke('get-user-info', { ...ctx, body: { userid: 'user id' }})
  console.log(res)
}
```

我们通过调用 `cloud.invoke` 方法可以在云函数中调用其他云函数。

该方法接收两个参数：第一个参数为 待调用的函数名，第二个参数为传递的数据

可以看到，`body` 传入了我们请求参数，如果函数内部需要使用ctx中的某些属性，还可用 `...ctx` 的方式传入ctx以便被调用函数使用。
