---
title: Invoking Cloud Functions
---

# {{ $frontmatter.title }}

Once a cloud function is developed and published, it can be called from other cloud functions.

::: info
The `cloud.invoke` method is deprecated. Please use [importing cloud functions](/guide/function/use-function.html#importing-cloud-functions) instead.
:::

## Writing and Publishing the Function to be Called

For example, let's create a cloud function named `get-user-info` and write the following code:

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

This function accepts a parameter called `userid`, searches for the corresponding user in the database based on the `id`, and returns the retrieved data.



## Invoking a Published Cloud Function

After the `get-user-info` cloud function is published, we can call this function from other cloud functions.

```typescript
import cloud from '@lafjs/cloud'

export async function main(ctx: FunctionContext) {
  const res = await cloud.invoke('get-user-info', { ...ctx, body: { userid: 'user id' }})
  console.log(res)
}
```

We can use the `cloud.invoke` method to call other cloud functions within a cloud function.

This method takes two parameters: the first parameter is the name of the function to be called, and the second parameter is the data to be passed.

As you can see, we pass the request parameters in the `body` object. If the called function needs to access certain properties from the `ctx` object, you can also pass the `ctx` object using `...ctx` for the called function to use.