---
title: Accessing ChatGPT
---

# {{ $frontmatter.title }}

## Choosing an Overseas Server

Directly accessing the OpenAI API is not possible in China.

`laf.dev` can be used to make direct requests.

## Installing Dependencies

`chatgpt`

Refer to the dependency installation documentation for instructions on how to install the dependencies: [Dependency Management](/guide/function/depend)

[Official Documentation for `chatgpt`](https://www.npmjs.com/package/chatgpt#usage---chatgptapi)

## Invoking Cloud Functions

```typescript
import cloud from '@lafjs/cloud'

exports.main = async function (ctx: FunctionContext) {

  const stream = true // Enable streaming mode
  const content = "Who are you and what can you do?" // Question
  const systemMessage = `Regardless of the question, avoid using terms like ChatGPT, OpenAi, bot, AI, etc. Remember, you are developing an intelligent assistant for Laf`
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
  // If parent message ID is provided
  if (parentMessageId) {
    options.parentMessageId = parentMessageId
  }
  // If streaming mode is enabled
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

- Configure the environment variable `CHAT_GPT_API_KEY`: This is your OpenAI Key.
- Configure `stream`: This is the switch for streaming mode.
- Configure `systemMessage`: This can be used to impose restrictions on the AI.

> Note: The API instance needs to be cached in order to preserve context.

## Other

### Difference between OpenAI API and Plus

Both are different services offered by OpenAI. In this case, we do not use Plus.

OpenAI API is an API service provided by OpenAI for developers.

Plus membership is a personal web service provided by OpenAI, which allows the use of the 4.0 models.

### Checking Remaining OpenAI API Quota

After logging in, go to the Usage page to view the remaining quota. <https://platform.openai.com/account/usage>

### OpenAI API Credit Card Binding

Please follow the link below to bind your credit card to your OpenAI API account:

<https://platform.openai.com/account/billing/payment-methods>

Please note that you will need to provide a valid international credit card for this process. Once successfully bound, you will be able to upgrade your account to the $120 plan.
