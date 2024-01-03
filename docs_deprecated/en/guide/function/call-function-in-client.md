---
title: Calling in the Client
---

# {{ $frontmatter.title }}

Once the cloud function is written and published, it can be called from the client using `laf-client-sdk`.

::: info
Currently, the SDK only supports sending POST requests.
:::

## Installing the SDK in the Frontend Project

```shell
npm i laf-client-sdk
```

## Initializing the `cloud` Object

```typescript
import { Cloud } from "laf-client-sdk";

const cloud = new Cloud({
  baseUrl: "https://APPID.laf.run",   // Get APPID from the application list on the homepage
  getAccessToken: () => "",    // No authorization required here, leave it empty for now
})
```

## Calling the Cloud Function

```typescript
// The first argument here is the name of the cloud function, and the second argument is the data passed in, corresponding to ctx.body in the cloud function
const res = await cloud.invoke('get-user-info', { userid })

console.log(res)     // The content returned by the cloud function is stored in the variable `res`
```

It's convenient, right? With just a simple configuration and one line of code, you can call the cloud function.

## laf-client-sdk Detailed Documentation

View the detailed documentation: [client-sdk](/guide/client-sdk/)
