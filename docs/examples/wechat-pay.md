---
title: 发起微信支付云函数
---

# {{ $frontmatter.title }}

本案例以微信 native 支付为例，native 支付服务端下单之后微信支付会返回一个 code-url, 然后前端接收这个返回值，直接把这个 code-url 在前端
生成一个二维码即可用微信扫描支付，适合 PC 网站支付。

code-url 类似：`weixin://wxpay/bizpayurl?pr=aIQrOYOzz`

notify_url 也可以写一个 laf 云函数来接受支付结果的通知。

创建 `wx-pay` 云函数，添加依赖 [wxpay-v3](https://github.com/yangfuhe/node-wxpay)，编写以下代码：

```ts
import cloud from "@/cloud-sdk";
const Payment = require("wxpay-v3");

exports.main = async function (ctx: any) {
  const { goodsName, totalFee, payOrderId } = ctx.body;

  // create payment instance
  const payment = new Payment({
    appid: "应用ID",
    mchid: "商户id",
    private_key: getPrivateKey(),
    serial_no: "序列号",
    apiv3_private_key: "api v3密钥",
    notify_url: "付退款结果通知的回调地址",
  });

  // 下单
  const result = await payment.native({
    description: goodsName,
    out_trade_no: payOrderId,
    amount: {
      total: totalFee,
    },
  });
  return result;
};

function getPrivateKey() {
  const key = `-----BEGIN PRIVATE KEY-----
HOBHEk+4cdiPcvhowhC8ii7838DP4qC+18ibL/KAySWyZjUC/keOr4MxhxQ1T+OV
...
...
475J8ALCRltkgTSxicoXS7SpjLqvIH2FPpv2BI+qQ3nOmAugsRkeH9lZdC/nSC0m
uI205SwTsTaT70/vF90AwQ==
-----END PRIVATE KEY-----
`;
  return key;
}
```