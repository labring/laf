
# 对查询进行排序

你可以使用 `sort()` 方法对查询结果进行排序，其用法如下：

```typescript
sort({ field: 1 })
```

其中 `field` 为排序字段，`1` 表示升序，`-1` 表示降序。

## 升序查询

```typescript
import cloud from '@lafjs/cloud'
const db = cloud.mongo.db

export default async function () {
  const docs = await db.collection('users')
    .find({})
    .sort({ age: 1})
    .toArray()

  console.log(docs)
}
```

## 降序查询

```typescript
import cloud from '@lafjs/cloud'
const db = cloud.mongo.db

export default async function () {
  const docs = await db.collection('users')
    .find({})
    .sort({ age: -1})
    .toArray()

  console.log(docs)
}
```


::: info 更多参考
- [sort() 完整说明](https://www.mongodb.com/docs/manual/reference/method/cursor.sort/)
- [API: sort()](https://mongodb.github.io/node-mongodb-native/5.0/classes/FindCursor.html#sort)
:::