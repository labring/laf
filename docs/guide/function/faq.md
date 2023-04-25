---
title: 云函数常见问题
---

# {{ $frontmatter.title }}

这里是云函数开发过程中可能会遇到的一些问题。欢迎Pr～

[[toc]]

## 云函数延迟执行

```typescript
import cloud from '@lafjs/cloud'

export async function main(ctx: FunctionContext) {
  const startTime = Date.now()
  console.log(startTime)
  await sleep(5000) // 延迟5秒
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
  // 如果getData的异步操作在4秒内完成并返回，则responseText为getDat的返回值
  // 如果4秒内未完成，则responseText为''，不影响getData的实际运行
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
  // 某个异步操作，以下通过sleep 模拟超过4秒的情况
  await sleep(5000)
  const text = "getData的返回值"
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
  const token = '123456'; // 这里的token自定义，需要对应微信后台的配置的token

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

## 云函数合成图片

需要先按照依赖 `canvas`

```typescript
import { createCanvas } from 'canvas'

export async function main(ctx: FunctionContext) {
  const canvas = createCanvas(200, 200)
  const context = canvas.getContext('2d')

  // Write "Awesome!"
  context.font = '30px Impact'
  context.rotate(0.1)
  context.fillText('Laf!', 50, 100)

  // Draw line under text
  var text = context.measureText('Laf!')
  context.strokeStyle = 'rgba(0,0,0,0.5)'
  context.beginPath()
  context.lineTo(50, 102)
  context.lineTo(50 + text.width, 102)
  context.stroke()

  // Write "Awesome!"context.font = '30px Impact'context.rotate(0.1)context.fillText('Awesome!', 50， 100)
  console.log(canvas.toDataURL())
  return `<img src= ${canvas.toDataURL()} />`
}
```

## 云函数防抖

通过Laf云函数的全局缓存可以很方便的设置防抖

以下是一个简单的防抖例子，前端请求时，需要在 header 中带上用户token。

```typescript
// 云函数生成Token
const accessToken_payload = {
  // 除了示例的，还可以加别的参数
  uid: login_user[0]._id, //一般是user表的_id
  role: login_user[0].role, //如果没有role，可以不要
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
  let lastCallTime = await cloud.shared.get(sharedName)
  console.log(lastCallTime)
  if (lastCallTime > Date.now()) {
    console.log("请求太快了")
    return '请求太快了'
  }
  await cloud.shared.set(sharedName, Date.now() + 1000)
  // 原有逻辑

  // 逻辑完毕后删除全局缓存
  await cloud.shared.delete(sharedName)
}
```
