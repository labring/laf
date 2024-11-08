
# 快速开始

本文将指引你开发一个简单的「用户登录/注册」的功能，快速体验 `laf` 云开发，预计完成时间 5 分钟。


## 创建应用

1. 你需要在 [laf.run](https://laf.run) 上注册一个账户
2. 在 [laf 控制台](https://laf.run)，点击左上角的 `新建` 按钮，创建一个新应用
3. 待应用成功启动后，点击右侧「开发」按钮，进入应用的「开发控制台」，接下来，我们将在「开发控制台」进行第一个 `laf` 应用的功能开发

## 编写云函数

本教程会编写两个云函数：

- `register` 处理注册请求
- `login` 处理登录请求。

### 用户注册云函数

在「云函数」管理页面，点击「新建函数」，创建注册云函数 `register`，

点击 `register` 函数，进入 WebIDE，编写以下代码：

```typescript
import cloud from "@lafjs/cloud";
import { createHash } from "crypto";

const db = cloud.mongo.db

export default async function (ctx: FunctionContext) {
  const username = ctx.body?.username || "";
  const password = ctx.body?.password || "";

  // check param
  if (!/^[a-zA-Z0-9]{3,16}$/.test(username))
    return { error: "invalid username" };
  if (!/^[a-zA-Z0-9]{3,16}$/.test(password))
    return { error: "invalid password" };

  // check username existed
  const exists = await db
    .collection("users")
    .countDocuments({ username: username })

  if (exists > 0) return { error: "username already existed" };

  // add user
  const res = await db.collection("users").insertOne({
    username: username,
    password: createHash("sha256").update(password).digest("hex"),
    created_at: new Date(),
  });

  console.log("user registered: ", res.insertedId);
  return { data: res.insertedId };
};
```

点击右上角的「发布」函数即发布上线！

### 用户登录云函数

同上，创建 `login` 云函数，编写以下代码：

```typescript
import cloud from "@lafjs/cloud";
import { createHash } from "crypto";

const db = cloud.mongo.db

export default async function (ctx: FunctionContext) {
  const username = ctx.body?.username || ""
  const password = ctx.body?.password || ""

  // check user login
  const user = await db
    .collection("users")
    .findOne({
      username: username,
      password: createHash("sha256").update(password).digest("hex"),
    })

  if (!user) return { error: "invalid username or password" };

  // generate jwt token
  const user_id = user._id;
  const payload = {
    uid: user_id,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
  };

  const access_token = cloud.getToken(payload);

  return {
    uid: user_id,
    access_token: access_token,
  };
};
```

点击右上角的「发布」函数即发布上线！

::: details 使用 curl 调用云函数

你可以在右上方复制云函数的调用地址，
或将以下 curl 命令中的 `APPID` 替换成你的 APPID 后执行：

```bash
# 注册用户
curl -X POST -H "Content-Type: application/json" -d '{"username": "admin", "password": "admin"}' https://APPID.laf.run/register

# 用户登录
curl -X POST -H "Content-Type: application/json" -d '{"username": "admin", "password": "admin"}' https://APPID.laf.run/login

```
:::


::: details 在前端项目中用 HTTP 请求调用云函数

```js
import axios from 'axios'

const baseUrl = 'https://APPID.laf.run'

// register
async function register(username, password) {
  try {
    const response = await axios.post(baseUrl + "/register", {
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
    const response = await axios.post(baseUrl + "/login", {
      username: username,
      password: password
    })
    console.log(response)
  } catch (error) {
    console.error(error)
  }
}
```

可以在你的 Vue/React/Angular/小程序 页面中调用这两个云函数完成具体的登录注册功能！
:::

## 下一步

::: tip
- [云函数](/zh/cloud-function/)
- [云数据库](/zh/cloud-database/)
- [云存储](/zh/cloud-storage/)
:::
