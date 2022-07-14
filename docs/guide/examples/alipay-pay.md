---
title: 支付宝支付云函数
---

# {{ $frontmatter.title }}

创建 `aliPay` 云函数，添加依赖 alipay-sdk ，编写以下代码：

```ts
import cloud from "@/cloud-sdk";
import alipay from "alipay-sdk";
const AlipayFormData = require("alipay-sdk/lib/form").default;

exports.main = async function (ctx) {
  const { totalFee, goodsName, goodsDetail, payOrderId } = ctx.body;

  const ali = new alipay({
    appId: "2016091800536572",
    signType: "RSA2",
    privateKey: "MIIEow......Yf2Mlz6xqG/Aq",
    alipayPublicKey: "MIIBI......IDAQAB",
    gateway: "https://openapi.alipaydev.com/gateway.do", //沙箱测试网关
  });

  const formData = new AlipayFormData();
  formData.setMethod("get");
  formData.addField(
    "notifyUrl",
    "https://APPID.lafyun.com/alipay_notify_callback"
  );
  formData.addField("bizContent", {
    subject: goodsName,
    body: goodsDetail,
    outTradeNo: payOrderId,
    totalAmount: totalFee,
  });

  const result = await ali.exec(
    "alipay.trade.app.pay",
    {},
    { formData: formData }
  );

  return {
    code: 0,
    data: result,
  };
};
```
