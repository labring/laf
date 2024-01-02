
# 在云函数中删除文件

::: tip
在云函数中操作云存储，需要提前创建一个存储桶（Bucket），以下示例使用 `data` 存储桶演示上传文件操作，请提前创建该存储桶。
:::

## 删除文件

```ts
import cloud from '@lafjs/cloud'

export default async function (ctx: FunctionContext) {
  // 获取存储桶
  const bucket = cloud.storage.bucket('data')

  // 删除文件
  await bucket.deleteFile('index.html')
}
```

::: tip
注意：如果文件不存在，也会正常返回，不会抛出异常。
:::
