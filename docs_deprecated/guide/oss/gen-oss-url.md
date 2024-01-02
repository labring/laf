---
title: 使用云函数生成上传和下载地址
---

# {{ $frontmatter.title }}


## 生成上传地址

使用云函数生成一个临时的上传地址，客户端可直接使用该地址上传文件。

### 创建 `get-upload-url` 云函数

创建云函数 `get-upload-url`，添加如下代码：

```typescript
import cloud from '@lafjs/cloud'

export default async function (ctx: FunctionContext) {
  const bucket = cloud.storage.bucket('cloud-bin')

  // 第二个参数为上传地址有效期，单位为秒， 3600 * 24 为 24 小时
  const url = bucket.getUploadUrl('laf.json', 3600 * 24)
  return url
}

```

### 使用 curl 测试上传地址

```bash
# 获取上传地址
upload_url=$(curl -s https://YOUR_APPID.laf.run/gen-oss-upload-url)

# 上传文件
curl -X PUT -H "Content-Type: application/json" -d '{"name":"hi, laf"}' $upload_url
```

## 生成下载地址

使用云函数生成一个临时的下载地址，客户端可直接使用该地址下载文件。

### 创建 `get-download-url` 云函数

创建云函数 `get-download-url`，添加如下代码：

```typescript
import cloud from '@lafjs/cloud'

export default async function (ctx: FunctionContext) {
  const bucket = cloud.storage.bucket('cloud-bin')
  
  // 第二个参数为下载地址有效期，单位为秒， 3600 * 24 为 24 小时
  const url = await bucket.getDownloadUrl('test.html', 3600 * 24)
  return url
}

```

### 使用 curl 测试下载地址

```bash
# 获取下载地址
download_url=$(curl -s https://YOUR_APPID.laf.run/gen-oss-download-url)

# 下载文件
curl -X GET $download_url
```


