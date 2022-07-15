---
title: 阿里云短信服务发验证码的云函数
---

# {{ $frontmatter.title }}

使用阿里云短信接口，编写发送短信验证码的云函数。
需要你提供阿里云短信服务的 `AccessKey` 和 `SecretKey`，以及短信模板 ID。

创建 `sendsms` 云函数，添加依赖 @alicloud/dysmsapi20170525，编写以下代码：

```ts
import Dysmsapi, * as dysmsapi from "@alicloud/dysmsapi20170525";
import * as OpenApi from "@alicloud/openapi-client";
import * as Util from "@alicloud/tea-util";

const accessKeyId = "xxxxxxxxxxxxxx";
const accessKeySecret = "xxxxxxxxxxxxxx";
const signName = "XXXX";
const templateCode = "SMS_xxxxx";
const endpoint = "dysmsapi.aliyuncs.com";

exports.main = async function (ctx: FunctionContext) {
  const { phone, code } = ctx.body;

  const sendSmsRequest = new dysmsapi.SendSmsRequest({
    phoneNumbers: phone,
    signName,
    templateCode,
    templateParam: `{"code":${code}}`,
  });

  const config = new OpenApi.Config({ accessKeyId, accessKeySecret, endpoint });
  const client = new Dysmsapi(config);
  const runtime = new Util.RuntimeOptions({});
  const res = await client.sendSmsWithOptions(sendSmsRequest, runtime);
  return res.body;
};
```
