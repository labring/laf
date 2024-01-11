---
title: Cloud Function Triggers
---

# {{ $frontmatter.title }}

A trigger is a way to initiate the execution of a function. We can bind triggers to cloud functions to control when they are invoked.

::: info
Currently, triggers only support the scheduled trigger type.
:::

## Creating a Trigger

![](/doc-images/create-injector.png)

Step 1: Click on the trigger button on the right side of the function list.

Step 2: Create a new trigger.

Step 3: Enter a name for the trigger for easy search and management in the future.

Step 4: Select the type of trigger. Currently, only scheduled triggers are supported.

Step 5: Choose the execution strategy for the scheduled task. Here, you can use cron expressions.

If you are not familiar with `cron` expressions, you can click on the link below to choose from three preset options.

Alternatively, you can click on the [More Examples](https://crontab.guru/examples.html) button to find the scheduled strategy you need or generate your own expression using the [Online Cron Expression](http://cron.ciding.cc/) website.

## A specific example

In the development process of WeChat Official Accounts, it is usually necessary to use a central control server to obtain and refresh the `access_token`. The `access_token` used by other business logic servers should all come from this central control server, and should not be refreshed individually. Otherwise, conflicts may occur, resulting in the access_token being overwritten and affecting the business.
Generally, the validity period of the `access_token` is 2 hours, and this problem can be solved well using a scheduled trigger.

1. First, let's create a cloud function named `get-access-token`.

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

In the above code, we follow the [Interface Call Request Instructions](https://developers.weixin.qq.com/doc/offiaccount/Basic_Information/Get_access_token.html) in the WeChat official documentation to request the `access_token` and store it in `cloud.shared`. Other business functions can read it at any time.

2. Use a trigger

![](/doc-images/use-injector.png)

Do you remember the process of creating a trigger just now? We only need to select the associated function as `get-access-token` and set the Cron expression to 2 hours to request the WeChat API every two hours to refresh the `access_token` to ensure validity.