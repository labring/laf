
# 在云函数中获取文件列表

::: tip
在云函数中操作云存储，需要提前创建一个存储桶（Bucket），以下示例使用 `data` 存储桶演示上传文件操作，请提前创建该存储桶。
:::

## 获取文件列表

```ts
import cloud from '@lafjs/cloud'

export default async function (ctx: FunctionContext) {
  // 获取存储桶
  const bucket = cloud.storage.bucket('data')

  // 获取文件列表
  const res = await bucket.listFiles()
  return res
}
```

返回结果 `res.Contents` 格式如下：

```json
 [
    {
      "Key": "laf.jpg",
      "LastModified": "2023-12-12T12:03:36.154Z",
      "ETag": "f0ce41411bdec6212f0836ebfbc56375",
      "Size": 49425
    },
    {
      "Key": "test.html",
      "LastModified": "2023-12-12T11:38:53.117Z",
      "ETag": "08ba5fadaac344913c216bcd26348263",
      "Size": 10
    }
]
```


## 只获取当前目录下的文件列表
  
```ts
import cloud from '@lafjs/cloud'

export default async function (ctx: FunctionContext) {
  // 获取存储桶
  const bucket = cloud.storage.bucket('data')

  // 获取文件列表
  const res = await bucket.listFiles({ Delimiter: '/' })
  return res
}
```

::: info
`Delimiter` 是一个分隔符，用于对存储桶中的对象名称进行分组。如果您希望获取当前目录下的文件列表，可以使用 `Delimiter` 参数。
若不指定 `Delimiter` 参数，则返回存储桶中所有文件的列表，包括子目录下的文件。
:::


## 获取子目录下的文件列表


```ts
import cloud from '@lafjs/cloud'

export default async function (ctx: FunctionContext) {
  // 获取存储桶
  const bucket = cloud.storage.bucket('data')

  // 获取 `images/` 目录下的文件列表
  const res = await bucket.listFiles({ Prefix: 'images/', Delimiter: '/' })
  return res
}
```

::: tip
`Prefix` 是一个前缀，用于对存储桶中的对象名称进行筛选。如果您希望获取子目录下的文件列表，可以使用 `Prefix` 参数。
:::


## 获取指定数量的文件列表

```ts
import cloud from '@lafjs/cloud'

export default async function (ctx: FunctionContext) {
  // 获取存储桶
  const bucket = cloud.storage.bucket('data')

  // 获取前 10 个文件
  const res = await bucket.listFiles({ MaxKeys: 10 })
  return res
}
```

::: tip
`MaxKeys` 用于对存储桶中的对象数量进行限定。如果您希望获取指定数量的文件列表，可以使用 `MaxKeys` 参数，默认值为 1000。
:::

## 分页获取文件列表

```ts
import cloud from '@lafjs/cloud'

export default async function (ctx: FunctionContext) {
  const marker = ctx.query.marker
  const bucket = cloud.storage.bucket('data')
  const res = await bucket.listFiles({ MaxKeys: 10, Marker: marker })
  return res
}
```

::: tip
`listFiles` 返回的 res 对象中包含 `NextMarker` 和 `IsTruncated` 两个属性，用于分页获取下一页文件列表：

- `IsTruncated` 用于判断是否还有下一页文件列表，如果为 `true`，则表示还有下一页文件列表，否则表示已经是最后一页文件列表。
- `NextMarker` 用于指定下一页文件列表的起始位置，如果 `IsTruncated` 为 `true`，则可以使用 `NextMarker` 作为 `Marker` 参数，获取下一页文件列表。
:::