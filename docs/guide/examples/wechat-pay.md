---
title: 发起微信支付云函数
---

### 微信支付云函数

> 创建 `wx-pay` 云函数，添加依赖 [wxpay-v3](https://github.com/yangfuhe/node-wxpay)，编写以下代码：

```ts
import cloud from '@/cloud-sdk'
const Payment = require('wxpay-v3')

exports.main = async function (ctx: any) {
  const { goodsName, totalFee, payOrderId } = ctx.body

  // create payment instance
  const payment = new Payment({
    appid: "应用ID",
    mchid: "商户id",
    private_key: getPrivateKey(),
    serial_no: "序列号",
    apiv3_private_key: "api v3密钥",
    notify_url: "付退款结果通知的回调地址",
  })

  // 下单
  const result = await payment.native({
    description: goodsName,
    out_trade_no: payOrderId,
    amount: {
      total: totalFee
    }
  })
  return result
}

function getPrivateKey() {
  const key = `-----BEGIN PRIVATE KEY-----
HOBHEk+4cdiPcvhowhC8ii7838DP4qC+18ibL/KAySWyZjUC/keOr4MxhxQ1T+OV
...
...
475J8ALCRltkgTSxicoXS7SpjLqvIH2FPpv2BI+qQ3nOmAugsRkeH9lZdC/nSC0m
uI205SwTsTaT70/vF90AwQ==
-----END PRIVATE KEY-----
`
  return key
}

```