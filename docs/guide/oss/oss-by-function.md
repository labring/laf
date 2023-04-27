---
title: 云存储操作云存储
---

# {{ $frontmatter.title }}

以下是用 S3 客户端来操作数据库，也有其他的操作方式，这里主要写 S3 客户端的操作方式。

:::tip
S3 客户端依赖 `@aws-sdk/client-s3` 已默认安装，无需重新安装
:::

## 初始化 S3 客户端

```typescript
import { S3 } from "@aws-sdk/client-s3";
const s3Client = new S3({
  endpoint: cloud.env.OSS_EXTERNAL_ENDPOINT,
  region: cloud.env.OSS_REGION,
  credentials: {
    accessKeyId: cloud.env.OSS_ACCESS_KEY,
    secretAccessKey: cloud.env.OSS_ACCESS_SECRET
  },
  forcePathStyle: true,
})
```

## 上传文件

```typescript
await s3Client.putObject({
  Bucket: bucket,
  Key: path,
  Body: content,
  ContentType: contentType
});
```

- Bucket 文件桶的名字 格式是：`${appid}-${bucketName}`
- Key 文件存储路径
  - 如果传入的路径不存在，会自动创建
  - 如果传入的文件存在，会自动覆盖源文件
- ContentType 上传文件的 `mimetype` 类型
- Body 文件对象
