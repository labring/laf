---
title: 云函数触发器
---

# {{ $frontmatter.title }}

触发器 (`Trigger`) 是触发函数执行的方式。我们可以给云函数绑定触发器来控制函数的调用。

::: info
当前 触发器 仅支持 定时触发器 类型。
:::

## 创建触发器

![](/doc-images/create-injector.png)

第一步：点击函数列表右侧的触发器按钮

第二步：新建触发器

第三步：输入触发器的名称，后期方便搜索和管理

第四步：选择触发器的类型，当前仅支持定时触发器

第五步：选择定时任务的执行策略，这里是支持 cron 原生表达式的。

如您对 `cron` 表达式不熟悉，可点击下方链接选择预置的三种方案。

或者也可以点击 [更多示例](https://crontab.guru/examples.html) 按钮找到您需要的定时策略，也可以在 [在线 Cron 表达式](http://cron.ciding.cc/) 网站上生成您需要的表达式。

## 一个具体的例子

在微信公众号开发过程中，通常需要我们使用中控服务器统一获取和刷新 `access_token` ，其他业务逻辑服务器所使用的 `access_token` 均来自于该中控服务器，不应该各自去刷新，否则容易造成冲突，导致 access_token 覆盖而影响业务。
一般来说，access_token 的有效期是 `2小时`, 利用定时触发器可以很好的解决这个问题。

1. 首先我们创建一个名为 `get-access-token` 的云函数

```typescript
import cloud from '@lafjs/cloud'
import axios from 'axios'

const AT_BASEURL = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential'
const APP_ID = 'your appid'
const APP_SECRET = 'your app secret'

export async function main(ctx: FunctionContext) {

  try {
    const request_url = `${AT_BASEURL}&appid=${APP_ID}&secret=${APP_SECRET}`
    const { data: { access_token, expires_in, errcode, errmsg } } = await axios.get(request_url)

    if (errcode) return { errcode, errmsg }
    
    // write into cloud.shared
    cloud.shared.set('_access_token', access_token)
    cloud.shared.set('_expired_time', expires_in)

  } catch (error) {
    return { 
      errcode: 500,
      err_msg: 'Get access token error: ' + error.toString() }
  }
  
}
```

上述代码中，我们遵循微信开放文档中的 [接口调用请求说明](https://developers.weixin.qq.com/doc/offiaccount/Basic_Information/Get_access_token.html) 来请求 `access_token`, 并将其存入 `cloud.shared` 中，其他业务函数可以随时进行读取。

2. 使用触发器

![](/doc-images/use-injector.png)

还记得刚才创建触发器的过程吗，我们只需选择关联的函数为 `get-access-token`, 并将 Cron 表达式设为 2 小时，即可实现每两小时去请求微信的接口，来刷新 access_token 以保证有效。
