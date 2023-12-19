---
title: laf-client-sdk
---

# {{ $frontmatter.title }}

## Introduction

laf provides frontend with `laf-client-sdk` for use in JavaScript runtime environments.

## Installation

```bash
npm install laf-client-sdk
```

## Usage Example

```js
import { Cloud } from "laf-client-sdk";

const cloud = new Cloud({
  // Replace APPID with your corresponding APPID here
  baseUrl: "https://APPID.laf.run",
  // This is the entry point for accessing database proxies, leave empty if not needed
  dbProxyUrl: "/proxy/app",
  // Token to be included in requests, can be empty
  getAccessToken: () => localStorage.getItem("access_token"),
});
```

## Parameters

`baseUrl`: Laf application link in the format of `https://APPID.laf.run`, where APPID is the appid of your Laf application.

`dbProxyUrl`: Database access strategy entry, starting with `/proxy/` followed by the name of the newly created strategy. Leave this parameter empty if no database operations are required.

`getAccessToken`: Token to be included in requests. The token is a JWT token. Can be empty if no permission is involved.

`environment`: Currently compatible with three types of environments `wxmp` `uniapp` `h5`. `wxmp` represents Wechat Mini Program.

## Usage in Wechat Mini Program

```js
import { Cloud } from "laf-client-sdk";

const cloud = new Cloud({
  baseUrl: "https://APPID.laf.run",
  dbProxyUrl: "/proxy/app",
  getAccessToken: () => wx.getStorageSync('access_token'),
  environment: "wxmp",
});
```

::: warning
When using NPM dependencies in Wechat Mini Program, you need to `Build NPM`.
:::

### Building Wechat Mini Program with `Typescript`

1. Initialize NPM in the terminal by executing `npm init -y` in the mini program project folder.

2. Install the client SDK by executing `npm i laf-client-sdk` in the mini program project folder.

3. Modify project.config.json

   Add the following under `setting`:

   ```typescript
   "packNpmManually": true,
   "packNpmRelationList": [
     {
       "packageJsonPath": "./package.json",
       "miniprogramNpmDistDir": "miniprogram/"
     }
   ]
   ```

4. Build NPM by clicking on "Tools"-"Build npm" in the Wechat developer tool.

5. Call the functions of the SDK in the page.

### Building Wechat Mini Program with `JavaScript`

1. Initialize NPM in the terminal by executing `npm init -y` in the mini program project folder.

2. Install the client SDK by executing `npm i laf-client-sdk` in the mini program project folder.

3. Build NPM by clicking on "Tools"-"Build npm" in the Wechat developer tool.

6. Call the functions of the SDK in the page.

## Usage in UNI-APP

```js
import { Cloud } from "laf-client-sdk";

const cloud = new Cloud({
  baseUrl: "https://APPID.laf.run",
  dbProxyUrl: "/proxy/app",
  getAccessToken: () => uni.getStorageSync("access_token"),
  environment: "uniapp",
});
```

## Usage in H5

```js
import { Cloud } from "laf-client-sdk";

const cloud = new Cloud({
  baseUrl: "https://APPID.laf.run",
  dbProxyUrl: "/proxy/app",
  getAccessToken: () => localStorage.getItem("access_token"),
  environment: "h5",
});
```

## Calling Cloud Functions

::: tip
`laf-client-sdk` only supports POST requests for calling cloud functions.
:::

```typescript
import { Cloud } from "laf-client-sdk";

const cloud = new Cloud({
  baseUrl: "https://APPID.laf.run",
  dbProxyUrl: "/proxy/app",
  getAccessToken: () => localStorage.getItem("access_token"),
});

// Call the getCode cloud function and pass in parameters
const res = await cloud.invoke("getCode", { phone: phone.value });
```

## Database Operation

:::tip
Using `laf-client-sdk`, we can operate the database just like in cloud functions. For more operation details, please refer to the [Cloud Database](/guide/db/) section.
Also, you need to configure the corresponding access policy.
:::

```typescript
import { Cloud } from "laf-client-sdk";

const cloud = new Cloud({
  baseUrl: "https://APPID.laf.run",
  dbProxyUrl: "/proxy/app", // Database access policy
  getAccessToken: () => localStorage.getItem("access_token"),
});
const db = cloud.database()

// Get data from the user table.
const res = await db.collection('user').get()
```