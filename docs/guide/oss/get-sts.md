---
title: 生成云存储临时令牌(STS)
---

# {{ $frontmatter.title }}

在「开发控制台」-> 「云函数」 -> 「依赖管理」，添加 `@aws-sdk/client-sts` 依赖（需重启应用生效）。

创建云函数 `get-oss-sts`，添加如下代码：

```ts
import cloud from "@/cloud-sdk";
import { STSClient, AssumeRoleCommand } from "@aws-sdk/client-sts";

exports.main = async function (ctx: FunctionContext) {
  const sts: any = new STSClient({
    region: cloud.env.OSS_REGION,
    endpoint: cloud.env.OSS_INTERNAL_ENDPOINT,
    credentials: {
      accessKeyId: cloud.env.OSS_ACCESS_KEY,
      secretAccessKey: cloud.env.OSS_ACCESS_SECRET,
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
    endpoint: cloud.env.OSS_EXTERNAL_ENDPOINT,
    region: cloud.env.OSS_REGION,
  };
};
```

> 保存 & 发布云函数，即可访问。

### 前端使用 STS 令牌访问云存储

@see [前端使用 STS 令牌访问云存储](use-sts-in-client.md)
