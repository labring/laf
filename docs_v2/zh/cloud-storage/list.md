
# 在云函数中获取文件列表

在云函数中操作云存储，需要提前创建一个存储桶（Bucket），以下示例使用 `data` 存储桶演示上传文件操作，请提前创建该存储桶。

## 获取文件列表

```ts
import cloud from '@lafjs/cloud'

export default async function (ctx: FunctionContext) {
  // 获取存储桶
  const bucket = cloud.storage.bucket('data')

  // 删除文件
  const res = await bucket.listFiles()
  return res.Contents
}
```

返回结果 `res.Contents` 格式如下：

```js
 [
  {
    Key: 'laf.jpg',
    LastModified: 2023-12-12T12:03:36.154Z,
    ETag: '"f0ce41411bdec6212f0836ebfbc56375"',
    Size: 49425
  },
  {
    Key: 'test.html',
    LastModified: 2023-12-12T11:38:53.117Z,
    ETag: '"08ba5fadaac344913c216bcd26348263"',
    Size: 10
  }
]
```