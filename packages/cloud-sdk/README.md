


> @lafjs/cloud is used in cloud function, exposing resource objects to cloud function.

```ts
import cloud from '@lafjs/cloud'

exports.main = async function (ctx) {

  const db = cloud.database()
  const res = await db.collection('messages').get()

  return res.data
}
```