---
title: Quick Start
---

# {{ $frontmatter.title }}

We will quickly experience the `laf` cloud development by developing a simple "user login/registration" feature on [laf.run](https://laf.run).

The following code may be difficult for beginners to understand, but you can first experience cloud functions and then learn more about the specific content of cloud functions.

## Preparation

1. You need to register an account on [laf.run](https://laf.run)
2. Log in to the [laf.run console](https://laf.run), click the "New" button in the upper left corner to create an empty application.
3. After the application starts successfully, click the "Development" button on the right side to enter the "Development Console" of the application. Next, we will develop the first `laf` application function in the "Development Console".

## Write Cloud Functions

This tutorial will write two cloud functions:

- `register` handles registration requests.
- `login` handles login requests.

### User Registration Cloud Function

On the "Cloud Function" management page, click "Create Function" to create the registration cloud function `register`.

Click the `register` function to enter WebIDE and write the following code:

```typescript
import cloud from "@lafjs/cloud";
import { createHash } from "crypto";

export default async function (ctx: FunctionContext) {
  const username = ctx.body?.username || "";
  const password = ctx.body?.password || "";

  // check param
  if (!/[a-zA-Z0-9]{3,16}/.test(username)) return { error: "invalid username" };
  if (!/[a-zA-Z0-9]{3,16}/.test(password)) return { error: "invalid password" };

  // check username existed
  const db = cloud.database();
  const exists = await db
    .collection("users")
    .where({ username: username })
    .count();

  if (exists.total > 0) return { error: "username already existed" };

  // add user
  const { id } = await db.collection("users").add({
    username: username,
    password: createHash("sha256").update(password).digest("hex"),
    created_at: new Date(),
  });

  console.log("user registered: ", id);
  return { data: id };
};
```

Click the "Publish" button in the upper right corner to publish it online!

### User Login Cloud Function

The same as above, create the `login` cloud function and write the following code:

```typescript
import cloud from "@lafjs/cloud";
import { createHash } from "crypto";

export default async function (ctx: FunctionContext) {
  const username = ctx.body?.username || "";
  const password = ctx.body?.password || "";

  // check user login
  const db = cloud.database();
  const res = await db
    .collection("users")
    .where({
      username: username,
      password: createHash("sha256").update(password).digest("hex"),
    })
    .getOne();

  if (!res.data) return { error: "invalid username or password" };

  // generate jwt token
  const user_id = res.data._id;
  const payload = {
    uid: user_id,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
  };

  const access_token = cloud.getToken(payload);

  return {
    uid: res.data._id,
    access_token: access_token,
  };
};
```

Click the "Publish" button in the upper right corner to publish it online!

## Use curl to call cloud functions

You can copy the calling address of the cloud function in the upper right corner,
or replace `APPID` in the following curl command with your own APPID and execute it:

```bash
# Register user
curl -X POST -H "Content-Type: application/json" -d '{"username": "admin", "password": "admin"}' https://APPID.laf.run/register

# User login
curl -X POST -H "Content-Type: application/json" -d '{"username": "admin", "password": "admin"}' https://APPID.laf.run/login


```

## Calling Cloud Functions with SDK in Front-end Projects

Install laf client sdk in your front-end project:

```bash
npm install laf-client-sdk
```

Then fill in the following code:

```typescript
// user.ts

import { Cloud } from "laf-client-sdk";

const cloud = new Cloud({
  baseUrl: "https://APPID.laf.run",
  getAccessToken: () => localStorage.getItem("access_token"),
});

// register function
export async function register(username: string, password: string) {
  const res = await cloud.invoke("register", {
    username: username,
    password: password,
  });

  return res;
}

// login function
export async function login(username: string, password: string) {
  const res = await cloud.invoke("login", {
    username: username,
    password: password,
  });

  if (res.access_token) {
    // save token
    localStorage.setItem("access_token", res.access_token);
  }

  return res;
}
```

## Calling Cloud Functions with HTTP Requests in Frontend Projects

```js
import axios from 'axios'

const url = 'https://APPID.laf.run'

// register
async function register(username, password) {
  try {
    const response = await axios.post(url + "register", {
      username: username,
      password: password
    });
    console.log(response);
  } catch (error) {
    console.error(error);
  }
}

// login
async function login(username, password) {
  try {
    const response = await axios.post(url + "login", {
      username: username,
      password: password
    });
    console.log(response);
  } catch (error) {
    console.error(error);
  }
}
```

Finally, you can call these two cloud functions in your Vue/React/Angular/WeChat Mini Program pages to implement the login and registration functionalities!