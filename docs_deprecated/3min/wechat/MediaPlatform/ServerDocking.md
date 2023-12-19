---
title: 服务器对接
---

# {{ $frontmatter.title }}

## 新建对接云函数

可任意命名。本示例代码为明文接入，可不用填写`消息加解密密钥`

:::tip
toXML 方法适用于所有的微信订阅号和服务号。

认证订阅号和服务号还可以使用客服消息功能去回复消息。
:::

```typescript
// 引入 crypto 和 cloud 模块
import * as crypto from 'crypto';
import cloud from '@lafjs/cloud';

// 处理接收到的微信公众号消息
export async function main(event) {
  const { signature, timestamp, nonce, echostr } = event.query;
  const token = process.env.WECHAT_TOKEN;

  // 验证消息是否合法，若不合法则返回错误信息
  if (!verifySignature(signature, timestamp, nonce, token)) {
    return 'Invalid signature';
  }

  // 如果是首次验证，则返回 echostr 给微信服务器
  if (echostr) {
    return echostr;
  }

  // 处理接收到的消息
  const payload = event.body.xml;
  console.log("receive message:", payload)
  // 文本消息
  if (payload.msgtype[0] === 'text') {
    const newMessage = {
      msgid: payload.msgid[0],
      question: payload.content[0].trim(),
      username: payload.fromusername[0],
      sessionId: payload.fromusername[0],
      createdAt: Date.now()
    }
    // 回复文本，这里演示，发什么消息回复什么消息
    const responseText = newMessage.question
    return toXML(payload, responseText);
  }

  // 其他情况直接回复 'success' 或者 '' 避免出现超时问题
  return 'success'
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

## 获取公众号令牌 Token 并配置

### 登录公众号后台

<https://mp.weixin.qq.com/> 扫码登录你的微信公众号

### 配置服务器

![MediaPlatformBaseSetting](/doc-images/MediaPlatformBaseSetting.png)

![MediaPlatformBaseSetting2](/doc-images/MediaPlatformBaseSetting2.png)

- step3 填入刚刚新建并已发布的云函数 Url

- step4 自定义一个`Token`，保持与云函数的环境变量中的`WECHAT_TOKEN`相同，这里设置后，也需要在 laf 应用中配置环境变量

- step5 明文模式这个用不到

如果配置无误，点击提交会显示`提交成功`

## 测试对话功能

在你的微信公众号发送文本，如果公众号回复与你相同的文字，就代表对接成功

## 更多功能可查看微信开发文档

:::tip
接入微信公众号消息功能最容易踩的坑。

在公众号接收到用户发送过来的消息，需要在 5 秒内做出响应，否则会自动重试 3 次。如对接 ChatGPT 很容易造成超时问题。

可以查看文档：[云函数设置某请求超时时间](/guide/function/faq.html#云函数设置某请求超时时间) 解决。

如果是认证订阅号或认证服务号，可考虑使用客服消息功能，会有更好的体验。
:::

开发消息相关能力可查看：<https://developers.weixin.qq.com/doc/offiaccount/Basic_Information/Access_Overview.html>

其他功能也都可以正常接入。
