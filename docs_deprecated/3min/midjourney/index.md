---
title: 接入 midjourney
---

# {{ $frontmatter.title }}

Laf 接入 Midjourney 是借助了 discord API，需要使用`laf.dev`调用。

## 开通 Midjourney

自行开通 Midjourney，需要充值 Midjourney 会员套餐。

## 安装依赖

`midjourney`

## 云函数调用

```typescript
import cloud from '@lafjs/cloud'
import { Midjourney, MidjourneyMessage } from 'midjourney'
const SERVER_ID = '' // Midjourney 服务 ID
const CHANNEL_ID = '' // Midjourney 频道 ID
const SALAI_TOKEN = '' // Midjourney 服务 Token

const Limit = 100
const MaxWait = 3

const client = new Midjourney({
  ServerId: SERVER_ID,
  ChannelId: CHANNEL_ID,
  SalaiToken: SALAI_TOKEN,
  Debug: true,
  SessionId: SALAI_TOKEN,
  Limit: Limit,
  MaxWait: MaxWait
});

export default async function (ctx: FunctionContext) {
  const { type, param } = ctx.body
  switch (type) {
    case 'RetrieveMessages':
      return await RetrieveMessages(param)
    case 'imagine':
      return await imagine(param)
    case 'upscale':
      return await upscale(param)
    case 'variation':
      return await variation(param)
  }

}

// 查询最近消息
async function RetrieveMessages(param) {
  console.log("RetrieveMessages")
  const client = new MidjourneyMessage({
    ChannelId: CHANNEL_ID,
    SalaiToken: SALAI_TOKEN,
  });
  const msg = await client.RetrieveMessages();
  console.log("RetrieveMessages success ", msg)
  return msg
}

// 创建生图任务
async function imagine(param) {
  console.log("imagine", param)
  const { question, msg_Id } = param
  const msg = await client.Imagine(
    `[${msg_Id}] ${question}`,
    (uri: string, progress: string) => {
      console.log("loading", uri, "progress", progress);
    }
  );
  console.log("imagine success ", msg)
  return true
}

// upscale 放大图片
async function upscale(param) {
  console.log("upscale", param)
  const { question, index, id, url } = param
  const hash = url.split("_").pop()?.split(".")[0] ?? ""
  console.log(hash)
  const msg = await client.Upscale(
    question,
    index,
    id,
    hash,
    (uri: string, progress: string) => {
      console.log("loading", uri, "progress", progress);
    }
  );
  console.log("upscale success ", msg)
  return msg
}

// variation 变换图片
async function variation(param) {
  console.log("variation", param)
  const client = new Midjourney({
    ServerId: SERVER_ID,
    ChannelId: CHANNEL_ID,
    SalaiToken: SALAI_TOKEN,
    Debug: true,
    SessionId: SALAI_TOKEN,
    Limit: Limit,
    MaxWait: 100
  });
  const { question, index, id, url } = param
  const hash = url.split("_").pop()?.split(".")[0] ?? ""
  const msg = await client.Variation(
    question,
    index,
    id,
    hash,
    (uri: string, progress: string) => {
      console.log("loading", uri, "progress", progress);
    }
  );
  console.log("variation success ", msg)
  return msg
}
```

## 获取参数

- 新建频道，并拉 midjourney 机器人进群
- 从 URL 中获取 SERVER_ID、CHANNEL_ID
- 从浏览器控制台获取 SALAI_TOKEN

![mj-id](../../doc-images/mj-id.png)

打开浏览器控制台，并切换到 NETWORK，进入 Fetch 标签页，刷新网页，选择任意一个请求，找到 authorization，这个就是 SALAI_TOKEN

![SALAI_TOKEN](../../doc-images/SALAI_TOKEN.jpg)

修改云函数中的 SERVER_ID、CHANNEL_ID、SALAI_TOKEN 并发布云函数

## 调用用例

用 POST 请求去请求这个云函数

以下是调用参数。

### 生成图片参数

`msg_Id` 调用时传入，自己生成，后续用来查询使用。`question` 是提示词。

```typescript
{
    "type":"imagine",
    "param":{
        "question": "a super man",
        "msg_Id":"1"
    }
}
```

### 查询全部历史消息参数

```typescript
{
    "type":"RetrieveMessages"
}
```

通过查询的历史消息可以获取图片信息等。

### 放大图片参数

`id` `url` 来自查询全部历史消息，`index` 是图片序号，`question` 是提示词。`id`为第一个`id`。

```typescript
{
    "type":"upscale",
    "param":{
        "index":2,
        "question": "a dog and a cat",
        "id":"1111579111815659551",
        "url":"https://cdn.discordapp.com/attachments/1110206663958466611/1111579111287164988/johnsonmaureen_2023_a_dog_and_a_cat_5927bc5d-5d80-423c-bf89-c2357d5aaf6b.png"
    }
}
```

### 变换图片参数

`id` `url` 来自查询全部历史消息，`index` 是图片序号，`question` 是提示词。`id`为第一个`id`。

```typescript
{
    "type":"variation",
    "param":{
        "index":2,
        "question": "a dog and a cat",
        "id":"1111579111815659551",
        "url":"https://cdn.discordapp.com/attachments/1110206663958466611/1111579111287164988/johnsonmaureen_2023_a_dog_and_a_cat_5927bc5d-5d80-423c-bf89-c2357d5aaf6b.png"
    }
}
```
