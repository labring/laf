---
title: 生成云存储临时令牌 (STS)
---

# {{ $frontmatter.title }}

前端或云函数环境以外的地方需要管理云存储，是需要一个 STS 临时令牌的，下面云函数可以直接请求并获取一个 STS 临时令牌。

## 创建`get-oss-sts`云函数

创建云函数 `get-oss-sts`，添加如下代码：

```typescript
import cloud from "@lafjs/cloud";
import { STSClient, AssumeRoleCommand } from "@aws-sdk/client-sts";

export default async function (ctx: FunctionContext) {
  const sts: any = new STSClient({
    region: process.env.OSS_REGION,
    endpoint: process.env.OSS_INTERNAL_ENDPOINT,
    credentials: {
      accessKeyId: process.env.OSS_ACCESS_KEY,
      secretAccessKey: process.env.OSS_ACCESS_SECRET,
    },
  });

  const cmd = new AssumeRoleCommand({
    DurationSeconds: 3600,
    Policy:
      '{"Version":"2012-10-17","Statement":[{"Sid":"Stmt1","Effect":"Allow","Action":"s3:*","Resource":"arn:aws:s3:::*"}]}',
    RoleArn: "arn:xxx:xxx:xxx:xxxx",
    RoleSessionName: cloud.appid,
  });

  const res = await sts.send(cmd);

  return {
    credentials: res.Credentials,
    endpoint: process.env.OSS_EXTERNAL_ENDPOINT,
    region: process.env.OSS_REGION,
  };
};
```

> 保存 & 发布云函数，即可访问。

## 前端使用 STS 令牌访问云存储

@see [前端使用 STS 令牌访问云存储](use-sts-in-client.md)
