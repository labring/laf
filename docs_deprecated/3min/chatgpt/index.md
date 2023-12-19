---
title: 接入 ChatGPT
---

# {{ $frontmatter.title }}

## 选择海外服务器

国内无法直接请求 OpenAI API

`laf.dev`可以直接请求

## 安装依赖

`chatgpt`

如何安装依赖可以参考依赖安装的文档：[依赖管理](/guide/function/depend)

[`chatgpt`官方文档](https://www.npmjs.com/package/chatgpt#usage---chatgptapi)

## 云函数调用

```typescript
import cloud from '@lafjs/cloud'

exports.main = async function (ctx: FunctionContext) {

  const stream = true // 流式加载开关
  const content = "你是谁，你能做什么？" // 问题
  const systemMessage = `不管问什么问题，都不要出现 ChatGPT、OpenAi、机器人、AI 等词汇，记住你是 Laf 官方开发的智能助理`
  const parentMessageId = ctx.query.parentMessageId

  const { ChatGPTAPI } = await import('chatgpt')
  let api = cloud.shared.get('chatgpt_api')
  if (!api) {
    api = new ChatGPTAPI({
      apiKey: process.env.CHAT_GPT_API_KEY
    })
    cloud.shared.set('chatgpt_api', api)
  }
  let options: any = {}
  options.systemMessage = systemMessage
  // 如果传了上下文 ID
  if (parentMessageId) {
    options.parentMessageId = parentMessageId
  }
  // 是否为流式加载
  if (stream) {
    ctx.response.setHeader('Content-Type', 'application/octet-stream');
    options.onProgress = (partialResponse => {
      if (partialResponse && partialResponse.delta != undefined) {
        console.log("loading", partialResponse)
        ctx.response.write(partialResponse.delta);
      }
    })
    const res = await api.sendMessage(content, options)
    console.log("success", res)
    ctx.response.end()
  }
  else {
    const res = await api.sendMessage(content, options)
    console.log("success", res)
    return res
  }
}
```

- 配置环境变量 CHAT_GPT_API_KEY：此为你的 OpenAI Key
- 配置 stream：此为流式加载切换开关
- 配置 systemMessage: 可以对 AI 做一些限制

>注意事项：需要将 api 实例保存到缓存中才可以保留上下文

## 其他

### OpenAI API 和 Plus 的区别

两者为 OpenAI 的 2 种不同的服务，我们这里用不到 Plus

OpenAI API 是 OpenAI 提供给开发者的 API 服务

Plus 会员是 OpenAI 提供的个人 Web 服务，可以使用 4.0 模型

### 查看 OpenAI API 剩余额度

登录后进入 Usage 页面查看剩余额度。<https://platform.openai.com/account/usage>

### OpenAI API 绑定信用卡

<https://platform.openai.com/account/billing/payment-methods>

需要使用国外信用卡，自行解决。绑定后就可以升级为 120 美金账户。
