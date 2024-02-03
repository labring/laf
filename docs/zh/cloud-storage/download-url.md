
# 使用云函数生成文件下载地址

::: tip
在云函数中操作云存储，需要提前创建一个存储桶（Bucket），以下示例使用 `data` 存储桶演示上传文件操作，请提前创建该存储桶。
:::

获取文件的访问地址有两种情况：
1. 若存储桶的访问权限为 `public` 或 `readonly`，则可直接使用文件的公共访问地址。
2. 若存储桶的访问权限为 `private`，则需要生成一个带签名的临时访问地址。


## 获取文件永久访问地址
::: tip
仅当存储桶的访问权限为 `public` 或 `readonly`，则可直接使用文件的公共访问地址。
且该地址永久有效，除非存储桶的访问权限被修改。
:::

```typescript
import cloud from '@lafjs/cloud'

export default async function (ctx: FunctionContext) {
  const bucket = cloud.storage.bucket('data')
  const url = bucket.externalUrl('index.html')
  return url
}
```


## 获取文件临时访问地址（带签名）

使用云函数生成一个临时的下载地址，客户端可直接使用该地址下载文件。

::: tip
当存储桶的访问权限为 `private`，则需要生成一个带签名的临时访问地址。
且该地址默认有效期为 3600 秒，即 1 小时。
:::

```typescript
import cloud from '@lafjs/cloud'

export default async function (ctx: FunctionContext) {
  const bucket = cloud.storage.bucket('data')
  const url = await bucket.getDownloadUrl('index.html')
  return url
}

```

::: details 使用 curl 测试下载地址

```bash
# 下载文件，请将 YOUR_DOWNLOAD_URL 替换为上一步获取的下载地址
curl -X GET YOUR_DOWNLOAD_URL
```
:::

## 设置文件下载地址的有效期

::: info
- 地址默认有效期为 3600 秒，即 1 小时。
- 最大有效期为 3600 * 24 * 7 秒，即 7 天。
:::

```typescript
import cloud from '@lafjs/cloud'

export default async function (ctx: FunctionContext) {
  const bucket = cloud.storage.bucket('data')

  // 第二个参数为下载地址有效期，单位为秒
  const url = bucket.getDownloadUrl('index.html', 3600 * 24 * 7)
  return url
}
```