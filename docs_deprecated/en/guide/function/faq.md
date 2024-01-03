---
title: Common Issues with Cloud Functions
---

# {{ $frontmatter.title }}

Here are some common issues that you may encounter during cloud function development. Feel free to contribute through PR~

[[toc]]

## Frontend Cross-Origin Resource Sharing (CORS)

By default, LAF cloud functions do not have any domain restrictions. However, some developers still face CORS issues during the development process. You can set `withCredentials` to `false`.

Here are three common ways to set `withCredentials` to `false`:

```js
// Method 1
axios.defaults.withCredentials = false

// Method 2
axios.get('http://example.com', {
  withCredentials: false 
})

// Method 3
XMLHttpRequest.prototype.withCredentials = false
```

## Delayed Execution of Cloud Functions

```typescript
import cloud from '@lafjs/cloud'

export async function main(ctx: FunctionContext) {
  const startTime = Date.now()
  console.log(startTime)
  await sleep(5000) // Delay for 5 seconds
  console.log(Date.now() - startTime)
}

async function sleep(ms) {
  return new Promise(resolve =>
    setTimeout(resolve, ms)
  );
}
```

## Setting a Timeout for a Cloud Function

```typescript
import cloud from '@lafjs/cloud'

export async function main(ctx: FunctionContext) {
  // If the asynchronous operation in getData is completed and returned within 4 seconds, responseText will be the returned value of getData
  // If not completed within 4 seconds, responseText will be '', but it does not affect the actual execution of getData
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
  // Some asynchronous operation, here we simulate a case where it takes more than 4 seconds using sleep
  await sleep(5000)
  const text = "Return value of getData"
  console.log(text, Date.now())
  return text
}
```

## Simple Example of Integrating Cloud Functions with WeChat Official Account

The following code is only compatible with plaintext mode.

```typescript
import * as crypto from 'crypto'
import cloud from '@lafjs/cloud'

export async function main(ctx: FunctionContext) {
  const { signature, timestamp, nonce, echostr } = ctx.query;
  const token = '123456'; // The token here is custom and needs to correspond to the token configured in the WeChat backend

  // Verify if the message is legitimate. If not, return an error message.
  if (!verifySignature(signature, timestamp, nonce, token)) {
    return 'Invalid signature';
  }

  // If it is the first verification, return echostr to the WeChat server
  if (echostr) {
    return echostr;
  }

  // Handle the received message
  const payload = ctx.body.xml;
  // If the received message type is text
  if (payload.msgtype[0] === 'text') {
    // Reply with the same content sent by the official account
    return toXML(payload, payload.content[0]);
  }
}

// Check if the message sent by the WeChat server is legitimate
function verifySignature(signature, timestamp, nonce, token) {
  const arr = [token, timestamp, nonce].sort();
  const str = arr.join('');
  const sha1 = crypto.createHash('sha1');
  sha1.update(str);
  return sha1.digest('hex') === signature;
}

// Return the assembled XML
function toXML(payload, content) {
  const timestamp = Date.now();
  const { tousername: fromUserName, fromusername: toUserName } = payload;
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

## Cloud Function for Image Composition

First, you need to install the dependency `canvas`.

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
  return `<img src=${canvas.toDataURL()} />`
}
```

## Cloud Function for Image Composition with Chinese Fonts

First, upload the font file that supports Chinese fonts to cloud storage and get the download URL for the font. Then save it to a temporary file and use it for composition through canvas.

:::tip
Temporary files will be cleared when Laf restarts.
:::

```typescript
import { createCanvas, registerFont } from 'canvas'
import fs from 'fs'
import cloud from '@lafjs/cloud'

export async function main(ctx: FunctionContext) {

  const url = ''  // Font file URL
  const dest = '/tmp/fangzheng.ttf'  // Local save path

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
  return `<img src=${canvas.toDataURL()} />`
}
```

## Cloud Function for Debouncing

Debouncing can be easily set up using the global cache of Laf Cloud Functions.

Here is a simple example of debouncing. When making a request from the frontend, you need to include the user token in the header.

```typescript
// Cloud function generates Token
const accessToken_payload = {
  // Besides the examples, you can also add other parameters
  uid: login_user[0]._id, // Usually the _id of the user table
  role: login_user[0].role, // If there is no role, it can be omitted
  exp: (Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7) * 1000, // Expires in 7 days
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
    console.log("Request is too fast")
    return 'Request is too fast'
  }
  cloud.shared.set(sharedName, Date.now() + 1000)
  // Original logic

  // Delete global cache after logic completion
  cloud.shared.delete(sharedName)
}
```

## Cloud Function Domain Verification

Some WeChat services require verification of the value of a txt file starting with "MP" in order to determine if the domain has permission.

You can create a cloud function with the same file name, such as `MP_123456789.txt`, and simply return the content of the text file.

```typescript
import cloud from '@lafjs/cloud'

export async function main(ctx: FunctionContext) {
  // Here we simply return the content of the text file
  return 'abcd...'
}
```

## Laf Application IP Pool (IP Whitelist)

To check the IP pool used by Laf.run, use laf.dev or other variations, replace the domain in the following commands.

- For Windows, execute `nslookup laf.run` in CMD.
- For Mac, execute `nslookup laf.run` in Terminal.

This will display the entire IP pool.

## Cloud Function for Sending Aliyun SMS Verification Code

Use the Aliyun SMS API to write a cloud function for sending SMS verification codes. You will need to provide the `AccessKey` and `SecretKey` for Aliyun SMS service, as well as the SMS template ID.

Create a `sendsms` cloud function and add the dependency `@alicloud/dysmsapi20170525`. Write the following code:

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

## Cloud Function for WeChat Native Payment

Native payment is suitable for scenarios such as PC websites, physical store items or orders, and media advertising payments. [Official WeChat Documentation](https://pay.weixin.qq.com/wiki/doc/apiv3_partner/open/pay/chapter2_7_0.shtml)

After the server-side order is placed for native payment, WeChat Pay will return a `code-url`, which can be directly used by the frontend to generate a QR code for WeChat payment.

- The structure of `code-url` is similar to: `weixin://wxpay/bizpayurl?pr=aIQrOYOzz`
- You can also write a Laf cloud function to receive payment result notifications. This code does not include the `notify_url`.

Create a `wx-pay` cloud function and install the dependency [wxpay-v3](https://github.com/yangfuhe/node-wxpay). Here is the code:

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

  // place an order
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

## Cloud Function AliPay Payment

Create an `aliPay` cloud function, install the `alipay-sdk` dependency, and write the following code:

```typescript
import clouasssssad from "@lafjs/cloud";
import alipay from "alipay-sdk";
const AlipayFormData = require("alipay-sdk/lib/form").default;


export default async function (ctx: FunctionContext) {
  const { totalFee, goodsName, goodsDetail, payOrderId } = ctx.body;

  const ali = new alipay({
    appId: "2016091800536572",
    signType: "RSA2",
    privateKey: "MIIEow......Yf2Mlz6xqG/Aq",
    alipayPublicKey: "MIIBI......IDAQAB",
    gateway: "https://openapi.alipaydev.com/gateway.do", // Sandbox test gateway
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

## Cloud Function Send Email

Send emails using SMTP service.

Create a `sendmail` cloud function, install the `nodemailer` dependency, and write the following code:

```typescript
import nodemailer from 'nodemailer'

// Mail server configuration
const transportConfig = {
  host: 'smtp.exmail.qq.com', // smtp service address, e.g., Tencent Enterprise Mail address
  port: 465,  // smtp service port, usually not open by default, need to manually enable
  secureConnection: true, // Use SSL
  auth: {
    user: 'sender@xx.com',  // sender's email, replace it with your own email address
    pass: 'your password',  // SMTP dedicated password or login password set by you, different for each service, QQ Mail needs to enable and configure an authorization code
  }
}

// Email configuration
const mailOptions = {
  from: '"SenderName" <sender@xx.com>', // sender
  to: 'hi@xx.com', // recipient
  subject: 'Hello',   // email subject
  html: '<b>Hello world?</b>'  // HTML formatted email body
  // text: 'hello'  // text format email body
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

## Uploading Files to WeChat Official Account Temporary Media

To reply with an image or file in a WeChat Official Account, you need to upload the file to temporary media first.

The following example shows how to upload a file to temporary media using a file URL:

```typescript
import fs from 'fs';
const request = require('request');
const util = require('util');
const postRequest = util.promisify(request.post);

export default async function (ctx: FunctionContext) {
  const res = await UploadToWeixin(url);
  console.log(res);
}

async function UploadToWeixin(url) {
  const res = await cloud.fetch.get(url, {
    responseType: 'arraybuffer'
  });
  fs.writeFileSync('/tmp/tmp.jpg', Buffer.from(res.data));
  // The demonstration of getAccess_token is not provided here
  const access_token = await getAccess_token();
  const formData = {
    media: {
      value: fs.createReadStream('/tmp/tmp.jpg'),
      options: {
        filename: 'tmp.png',
        contentType: 'image/png'
      }
    }
  };
  // Due to a bug in axios when uploading WeChat media, request is used here to wrap the post request for uploading
  const uploadResponse = await postRequest({
    url: `https://api.weixin.qq.com/cgi-bin/media/upload?access_token=${access_token}&type=image`,
    formData: formData
  });
  return uploadResponse.body;
}
```

## Laf Function Authentication, Token Retrieval, and Token Expiration Handling

Original Post: <https://forum.laf.run/d/535>

Process:

1. The cloud function generates a token and returns it to the frontend.
2. The frontend includes the token in its requests.
3. The cloud function checks whether the `ctx.user` contains the token and if it has expired.

Example Code:

1. The cloud function generates a token and returns it to the frontend.

```typescript
import cloud from '@lafjs/cloud'

export async function main(ctx: FunctionContext) {

  const payload = {
    // uid is usually the user ID from the database, this is just a demo
    uid: 1,
    // For demonstration purposes, the expiration time is set to 10 seconds
    // In reality, it would be something like: exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
    exp: Math.floor(Date.now() / 1000) + 10,
  };

  // Generate the access_token
  const access_token = cloud.getToken(payload);

  return { access_token }
}
```

2. The frontend includes the token in its requests.
The first method involves using the `laf-client-sdk`.

```typescript
import { Cloud } from "laf-client-sdk"; // Import laf-client-sdk
import axios from "axios";

// Create a cloud object
const cloud = new Cloud({
  baseUrl: "", // Fill in your cloud function URL, e.g., https://appid.laf.dev
  // Retrieve the access_token from local storage
  getAccessToken: () => localStorage.getItem("access_token"),
});
// When invoking a cloud function, the access_token will be automatically included
const res = await cloud.invoke("test");
```

The second method involves using axios.

```typescript
import axios from "axios";

const token = localStorage.getItem("access_token");
axios({
  method: "get",
  url: "functionUrl",
  headers: {
    // Include the token here
    Authorization: `Bearer ${token}`,
  },
})
```

3. The cloud function checks whether the `ctx.user` contains the token and if it has expired.

```typescript
import cloud from '@lafjs/cloud'

export async function main(ctx: FunctionContext) {

  console.log(ctx.user)
  // If the token was included by the frontend and has not expired: { uid: 1, exp: 1683861234, iat: 1683861224 }
  // If the token was not included or has expired: null

}
```
