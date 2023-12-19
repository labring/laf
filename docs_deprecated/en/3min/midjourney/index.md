---
title: Integration with midjourney
---

# {{ $frontmatter.title }}

Laf integrates with Midjourney using the Discord API and requires the use of `laf.dev`.

## Setting up Midjourney

To set up Midjourney, you need to purchase a Midjourney membership package.

## Installing Dependencies

`midjourney`

## Cloud Function Invocation

```typescript
import cloud from '@lafjs/cloud'
import { Midjourney, MidjourneyMessage } from 'midjourney'
const SERVER_ID = '' // Midjourney server ID
const CHANNEL_ID = '' // Midjourney channel ID
const SALAI_TOKEN = '' // Midjourney service token

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

// Retrieve recent messages
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

// Create an image generation task
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

// Upscale an image
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

// Variation of an image
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

## Get Parameters

- Create a new channel and invite the midjourney bot to join the group.
- Retrieve SERVER_ID and CHANNEL_ID from the URL.
- Obtain SALAI_TOKEN from the browser console.

![mj-id](../../doc-images/mj-id.png)

Open the browser console and switch to the NETWORK tab. Refresh the webpage and select any request. Find the "authorization" header, which contains the SALAI_TOKEN.

![SALAI_TOKEN](../../doc-images/SALAI_TOKEN.jpg)

Modify the SERVER_ID, CHANNEL_ID, and SALAI_TOKEN in the cloud function and publish it.

## Test Cases

Use a POST request to call this cloud function.

The following are the calling parameters.

### Generate Image Parameters

`msg_Id` is generated when calling the function and will be used for querying later. `question` is the prompt.

```typescript
{
    "type": "imagine",
    "param": {
        "question": "a super man",
        "msg_Id": "1"
    }
}
```

### Query All History Messages Parameters

```typescript
{
    "type": "RetrieveMessages"
}
```

By querying the history messages, you can obtain image information, etc.

### Enlarge Image Parameters

`id` and `url` come from querying all history messages. `index` is the image index, and `question` is the prompt. `id` is the first `id`.

```typescript
{
    "type": "upscale",
    "param": {
        "index": 2,
        "question": "a dog and a cat",
        "id": "1111579111815659551",
        "url": "https://cdn.discordapp.com/attachments/1110206663958466611/1111579111287164988/johnsonmaureen_2023_a_dog_and_a_cat_5927bc5d-5d80-423c-bf89-c2357d5aaf6b.png"
    }
}
```

### Transform Image Parameters

`id` and `url` are obtained from querying all the historical messages, `index` is the index of the image, `question` is the prompt. `id` is the first `id`.

```typescript
{
    "type": "variation",
    "param": {
        "index": 2,
        "question": "a dog and a cat",
        "id": "1111579111815659551",
        "url": "https://cdn.discordapp.com/attachments/1110206663958466611/1111579111287164988/johnsonmaureen_2023_a_dog_and_a_cat_5927bc5d-5d80-423c-bf89-c2357d5aaf6b.png"
    }
}
```