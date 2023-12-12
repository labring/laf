---
title: 云函数常见问题
---

# {{ $frontmatter.title }}

这里是云函数开发过程中可能会遇到的一些问题。欢迎 Pr～

[[toc]]

## 前端跨域

laf 云函数默认是没有域名限制的，但是部分同学在开发过程中发现，还是会出现跨域问题。可以将 `withCredentials` 设置为 `false`

下面是 3 种常见的`withCredentials` 设置为 `false`的方法：

```js
// 方式一
axios.defaults.withCredentials = false

// 方式二
axios.get('http://example.com', {
  withCredentials: false 
})

// 方式三
XMLHttpRequest.prototype.withCredentials = false
```

## 云函数延迟执行

```typescript
import cloud from '@lafjs/cloud'

export async function main(ctx: FunctionContext) {
  const startTime = Date.now()
  console.log(startTime)
  await sleep(5000) // 延迟 5 秒
  console.log(Date.now() - startTime)
}

async function sleep(ms) {
  return new Promise(resolve =>
    setTimeout(resolve, ms)
  );
}
```

## 云函数设置某请求超时时间

```typescript
import cloud from '@lafjs/cloud'

export async function main(ctx: FunctionContext) {
  // 如果 getData 的异步操作在 4 秒内完成并返回，则 responseText 为 getDat 的返回值
  // 如果 4 秒内未完成，则 responseText 为''，不影响 getData 的实际运行
  const responseText = await Promise.race([
    getData(),
    sleep(4000).then(() => ''),
  ]);
  console.log(responseText, Date.now())
}

async function sleep(ms) {
  return new Promise(resolve =>
    setTimeout(resolve, ms)
  );
}

async function getData(){
  // 某个异步操作，以下通过 sleep 模拟超过 4 秒的情况
  await sleep(5000)
  const text = "getData 的返回值"
  console.log(text, Date.now())
  return text
}
```

## 云函数对接公众号简单示例

以下代码只兼容明文模式

```typescript
import * as crypto from 'crypto'
import cloud from '@lafjs/cloud'

export async function main(ctx: FunctionContext) {
  const { signature, timestamp, nonce, echostr } = ctx.query;
  const token = '123456'; // 这里的 token 自定义，需要对应微信后台的配置的 token

  // 验证消息是否合法，若不合法则返回错误信息
  if (!verifySignature(signature, timestamp, nonce, token)) {
    return 'Invalid signature';
  }

  // 如果是首次验证，则返回 echostr 给微信服务器
  if (echostr) {
    return echostr;
  }

  // 处理接收到的消息
  const payload = ctx.body.xml;
  // 如果接收的是文本
  if (payload.msgtype[0] === 'text') {
    // 公众号发什么回复什么
    return toXML(payload, payload.content[0]);
  }
}

// 校验微信服务器发送的消息是否合法
function verifySignature(signature, timestamp, nonce, token) {
  const arr = [token, timestamp, nonce].sort();
  const str = arr.join('');
  const sha1 = crypto.createHash('sha1');
  sha1.update(str);
  return sha1.digest('hex') === signature;
}

// 返回组装 xml
function toXML(payload, content) {
  const timestamp = Date.now()
  const { tousername: fromUserName, fromusername: toUserName } = payload
  return `
  <xml>
    <ToUserName><![CDATA[${toUserName}]]></ToUserName>
    <FromUserName><![CDATA[${fromUserName}]]></FromUserName>
    <CreateTime>${timestamp}</CreateTime>
    <MsgType><![CDATA[text]]></MsgType>
    <Content><![CDATA[${content}]]></Content>
  </xml>
  `
}
```

## 云函数合成图片

需要先安装依赖 `canvas`

```typescript
import { createCanvas } from 'canvas'

export async function main(ctx: FunctionContext) {
  const canvas = createCanvas(200, 200)
  const context = canvas.getContext('2d')

  // Write "hello!"
  context.font = '30px Impact'
  context.rotate(0.1)
  context.fillText('hello!', 50, 100)

  // Draw line under text
  var text = context.measureText('hello!')
  context.strokeStyle = 'rgba(0,0,0,0.5)'
  context.beginPath()
  context.lineTo(50, 102)
  context.lineTo(30 + text.width, 102)
  context.stroke()

  // Write "Laf!"
  context.font = '30px Impact'
  context.rotate(0.1)
  context.fillText('Laf!', 50, 150)
  console.log(canvas.toDataURL())
  return `<img src= ${canvas.toDataURL()} />`
}
```

## 云函数合成带中文字体的图片

先把支持中文字体的字体文件上传到云存储，获得云存储的字体下载地址，然后保存到临时文件中，再去通过 canvas 合成。

:::tip
Laf 应用重启后，临时文件会清空哦～
:::

```typescript
import { createCanvas, registerFont } from 'canvas'
import fs from 'fs'
import cloud from '@lafjs/cloud'

export async function main(ctx: FunctionContext) {

  const url = ''  // 字体文件网址
  const dest = '/tmp/fangzheng.ttf'  // 本地保存路径

  if (fs.existsSync(dest)) {
    console.log('File exists!')
  } else {
    console.log('File does not exist')
    const res = await cloud.fetch({
      method: 'get',
      url,
      responseType: 'arraybuffer'
    })
    fs.writeFileSync(dest, Buffer.from(res.data))
  }

  registerFont('/tmp/fangzheng.ttf', { family: 'fangzheng' })
  const canvas = createCanvas(200, 200)
  const context = canvas.getContext('2d')

  // Write "你好！"
  context.font = '30px fangzheng'
  context.rotate(0.1)
  context.fillText('你好！', 50, 100)

  // Draw line under text
  var text = context.measureText('hello!')
  context.strokeStyle = 'rgba(0,0,0,0.5)'
  context.beginPath()
  context.lineTo(50, 102)
  context.lineTo(30 + text.width, 102)
  context.stroke()

  // Write "Laf!"
  context.font = '30px Impact'
  context.rotate(0.1)
  context.fillText('Laf!', 50, 150)
  console.log(canvas.toDataURL())
  return `<img src= ${canvas.toDataURL()} />`
}
```

## 云函数防抖

通过 Laf 云函数的全局缓存可以很方便的设置防抖

以下是一个简单的防抖例子，前端请求时，需要在 header 中带上用户 token。

```typescript
// 云函数生成 Token
const accessToken_payload = {
  // 除了示例的，还可以加别的参数
  uid: login_user[0]._id, //一般是 user 表的_id
  role: login_user[0].role, //如果没有 role，可以不要
  exp: (Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7) * 1000, //7天过期
}
const token = cloud.getToken(accessToken_payload)
console.log(token)
```

```typescript
import cloud from '@lafjs/cloud'

export async function main(ctx: FunctionContext) {
  const FunctionName = ctx.request.params.name
  const sharedName = FunctionName + ctx.user.uid
  let lastCallTime = cloud.shared.get(sharedName)
  console.log(lastCallTime)
  if (lastCallTime > Date.now()) {
    console.log("请求太快了")
    return '请求太快了'
  }
  cloud.shared.set(sharedName, Date.now() + 1000)
  // 原有逻辑

  // 逻辑完毕后删除全局缓存
  cloud.shared.delete(sharedName)
}
```

## 云函数域名验证

部分微信服务需要验证 MP 开头的 txt 文件的值，以判断域名是否有权限

可以新建一个该文件名的云函数，如：`MP_123456789.txt`

直接返回该文本的内容

```typescript
import cloud from '@lafjs/cloud'

export async function main(ctx: FunctionContext) {
  // 这里直接返回文本内容
  return 'abcd...'
}
```

## Laf 应用 IP 池（IP 白名单）

下满例子为使用的是 laf.run 的情况。使用 laf.dev 或其他，下面命令需要更换域名。

- Windows 可在 CMD 中执行 `nslookup laf.run`

- Mac 可在终端中执行 `nslookup laf.run`

可看到全部 IP 池

## 云函数发送阿里云短信验证码

使用阿里云短信接口，编写发送短信验证码的云函数。
需要你提供阿里云短信服务的 `AccessKey` 和 `SecretKey`，以及短信模板 ID。

创建 `sendsms` 云函数，添加依赖 @alicloud/dysmsapi20170525，编写以下代码：

```typescript
import Dysmsapi, * as dysmsapi from "@alicloud/dysmsapi20170525";
import * as OpenApi from "@alicloud/openapi-client";
import * as Util from "@alicloud/tea-util";

const accessKeyId = "xxxxxxxxxxxxxx";
const accessKeySecret = "xxxxxxxxxxxxxx";
const signName = "XXXX";
const templateCode = "SMS_xxxxx";
const endpoint = "dysmsapi.aliyuncs.com";


export default async function (ctx: FunctionContext) {
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

## 云函数微信 native 支付

Native 支付适用于 PC 网站、实体店单品或订单、媒体广告支付等场景。[微信官方介绍](https://pay.weixin.qq.com/wiki/doc/apiv3_partner/open/pay/chapter2_7_0.shtml)

Native 支付服务端下单之后微信支付会返回一个 code-url, 然后前端接收这个返回值，直接把这个 code-url 在前端
生成一个二维码即可用微信扫描支付。

- `code-url` 结构类似：`weixin://wxpay/bizpayurl?pr=aIQrOYOzz`

- `notify_url` 也可以写一个 laf 云函数来接受支付结果的通知。此处不包含 `notify_url` 代码。

创建 `wx-pay` 云函数，安装依赖 [wxpay-v3](https://github.com/yangfuhe/node-wxpay)，代码如下：

```typescript
import cloud from "@lafjs/cloud";
const Payment = require("wxpay-v3");

export default async function (ctx: FunctionContext) {
  const { goodsName, totalFee, payOrderId } = ctx.body;

  // create payment instance
  const payment = new Payment({
    appid: "应用 ID",
    mchid: "商户 id",
    private_key: getPrivateKey(),
    serial_no: "序列号",
    apiv3_private_key: "api v3 密钥",
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

## 云函数支付宝支付

创建 `aliPay` 云函数，安装依赖 `alipay-sdk`，编写以下代码：

```typescript
import cloud from "@lafjs/cloud";
import alipay from "alipay-sdk";
const AlipayFormData = require("alipay-sdk/lib/form").default;


export default async function (ctx: FunctionContext) {
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
    "https://APPID.laf.run/alipay_notify_callback"
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

## 云函数发送邮件

使用 SMTP 服务发送邮件

创建 `sendmail` 云函数，安装依赖 `nodemailer`，代码如下：

```typescript
import nodemailer from 'nodemailer'

// 邮件服务器配置
const transportConfig = {
  host: 'smtp.exmail.qq.com', // smtp 服务地址，示例腾讯企业邮箱地址
  port: 465,  // smtp 服务端口，一般服务器未开此端口，需要手动开启
  secureConnection: true, // 使用了 SSL
  auth: {
    user: 'sender@xx.com',  // 发件人邮箱，写你的邮箱地址即可
    pass: 'your password',  // 你设置的 smtp 专用密码或登录密码，每家服务不相同，QQ 邮箱需要开启并配置授权码，即这里的 pass
  }
}

// 邮件配置
const mailOptions = {
  from: '"SenderName" <sender@xx.com>', // 发件人
  to: 'hi@xx.com', // 收件人
  subject: 'Hello',   // 邮件主题
  html: '<b>Hello world?</b>'  // html 格式邮件正文
  // text: 'hello'  // 文本格式有限正文
}

export default async function (ctx: FunctionContext) {
  const transporter = nodemailer.createTransport(transportConfig)

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log('Message sent: %s', info.messageId);
    return info.messageId
  })
};
```

## 云函数上传文件到微信公众号临时素材

公众号回复图片或者文件，需要先把文件上传到临时素材才可以回复。

以下例子为，通过文件 URL 上传到临时素材

```typescript
import fs from 'fs'
const request = require('request');
const util = require('util');
const postRequest = util.promisify(request.post);

export default async function (ctx: FunctionContext) {
  const res = await UploadToWinxin(url)
  console.log(res)
}

async function UploadToWinxin(url) {
  const res = await cloud.fetch.get(url, {
    responseType: 'arraybuffer'
  })
  fs.writeFileSync('/tmp/tmp.jpg', Buffer.from(res.data))
  // 这里 getAccess_token 不做演示
  const access_token = await getAccess_token()
  const formData = {
    media: {
      value: fs.createReadStream('/tmp/tmp.jpg'),
      options: {
        filename: 'tmp.png',
        contentType: 'image/png'
      }
    }
  };
  // 由于 axios 上传微信素材有 BUG，所以这里使用 request 封装 post 请求来上传
  const uploadResponse = await postRequest({
    url: `https://api.weixin.qq.com/cgi-bin/media/upload?access_token=${access_token}&type=image`,
    formData: formData
  });
  return uploadResponse.body
 }
```

## Laf 云函数的鉴权，获取 token，token 过期处理

原帖：<https://forum.laf.run/d/535>

流程：
1.云函数生成 token 返回给前端。
2.前端请求时带上 token。
3.云函数中根据 `ctx.user` 来判断是否传 `token` 是否过期。

示例代码：
1.云函数生成 token 返回给前端。

```typescript
import cloud from '@lafjs/cloud'

export async function main(ctx: FunctionContext) {

  const payload = {
    // uid 一般用表里用户的 id 这里演示随便写
    uid: 1,
    // 这里做演示 过期时间设置为 10s 
    // 这样写就是过期时间 7 天 exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
    exp: Math.floor(Date.now() / 1000) + 10,
  };

  // 生成 access_token
  const access_token = cloud.getToken(payload);

  return { access_token }
}
```

2.前端请求时带上 token。
第一种使用 `laf-client-sdk`.

```typescript
import { Cloud } from "laf-client-sdk"; // 引入 laf-client-sdk
import axios from "axios";

// 创建 cloud 对象
const cloud = new Cloud({
  baseUrl: "", // 填你的云函数地址如：https://appid.laf.dev
  // 传入 access_token 从本地缓存中取出 access_token
  getAccessToken: () => localStorage.getItem("access_token"),
});
// invoke 调用云函数时会自动带上 access_token
const res = await cloud.invoke("test");
```

第二种通过 axios

```typescript
import axios from "axios";

const token = localStorage.getItem("access_token");
axios({
  method: "get",
  url: "functionUrl",
  headers: {
    // 这里带上 token
    Authorization: `Bearer ${token}`,
  },
})
```

3.云函数中根据 ctx.user 来判断是否传 token 是否过期。  

```typescript
import cloud from '@lafjs/cloud'

export async function main(ctx: FunctionContext) {

  console.log(ctx.user)
  // 如果前端传了 token 并且没过期： { uid: 1, exp: 1683861234, iat: 1683861224 }
  // 如果前端没传 token 或者 token 不在有效期：null

}
```
