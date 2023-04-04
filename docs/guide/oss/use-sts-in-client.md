---
title: 前端使用 STS 令牌访问云存储
---

# {{ $frontmatter.title }}

在前端使用 [使用云函数生成云存储临时令牌(STS)](get-sts.md) 生成的 STS 令牌信息，访问云存储。

1. 安装前端依赖

```bash
npm i @aws-sdk/client-s3 laf-client-sdk
```

2. 编写前端代码实现文件上传：

```ts
import { S3, PutObjectCommand } from "@aws-sdk/client-s3";
import { Cloud } from "laf-client-sdk";

const APPID = "YOUR_APPID";

const cloud = new Cloud({
  baseUrl: `https://${appid}.laf.run`,
  getAccessToken: () => localStorage.getItem("access_token"),
});

// 获取云存储临时令牌
const { credentials, endpoint, region } = await cloud.invoke("get-sts");

const s3 = new S3({
  endpoint: endpoint,
  region: region,
  credentials: {
    accessKeyId: credentials.AccessKeyId,
    secretAccessKey: credentials.SecretAccessKey,
    sessionToken: credentials.SessionToken,
    expiration: credentials.Expiration,
  },
  forcePathStyle: true,
});

// bucket name prefixed with appid
const bucket = `${APPID}-public`;
const cmd = new PutObjectCommand({
  Bucket: bucket,
  Key: "index.html",
  Body: "Hello from laf oss!", // 文件内容可以是二进制数据，也可以是文本数据， 或者是 File 对象
  ContentType: "text/html",
});

const res = await s3.send(cmd);
console.log(res);
```

::: info
这里我们使用 `@aws-sdk/client-s3` 库，实现文件上传，你可以使用任何兼容 aws s3 接口的 SDK 来替代，如 [minio js sdk](https://docs.min.io/docs/javascript-client-quickstart-guide.html)
:::
