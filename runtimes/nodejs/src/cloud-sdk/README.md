

> cloud-sdk is used in cloud function, exposing resource objects to cloud function.

```ts
import cloud from '@/cloud-sdk'

exports.main = async function (ctx) {

  const db = cloud.database()
  const res = await db.collection('admins').get()

  return res.data
}
```