

# 使用云函数生成文件上传地址


::: tip
在云函数中操作云存储，需要提前创建一个存储桶（Bucket），以下示例使用 `data` 存储桶演示上传文件操作，请提前创建该存储桶。
:::

## 生成上传地址

使用云函数生成一个临时的上传地址，客户端可直接使用该地址上传文件。


```typescript
import cloud from '@lafjs/cloud'

export default async function (ctx: FunctionContext) {
  const bucket = cloud.storage.bucket('data')
  const url = bucket.getUploadUrl('index.html')
  return url
}
```


::: details 使用 curl 测试上传地址

```bash
#请将 YOUR_UPLOAD_URL 替换为上一步获取的上传地址

curl -X PUT -H "Content-Type: text/html" -d 'hi, laf' YOUR_UPLOAD_URL
```
:::

## 设置上传地址有效期

::: info
- 生成的地址默认有效期为 3600 秒，即 1 小时。
- 可设置的最大有效期为 3600 * 24 * 7 秒，即 7 天。
:::

```typescript
import cloud from '@lafjs/cloud'

export default async function (ctx: FunctionContext) {
  const bucket = cloud.storage.bucket('data')

  // 第二个参数为上传地址有效期，单位为秒。
  const url = bucket.getUploadUrl('index.html', 3600 * 24 * 7)
  return url
}
```

