---
title: 在云函数中使用环境变量
---

# {{ $frontmatter.title }}


## 添加环境变量

1. 首先点击页面左下角的小齿轮按钮，打开应用设置页面

![](/doc-images/add-env-step1.png)


2. 其次在弹出的应用设置界面，点击 新增环境变量按钮，输入环境变量的 `key` 和 `value`, 并点击确定

![](/doc-images/add-env-step2.png)

3. 确认更新环境变量

::: warning
请注意，更新环境变量需要重启当前应用以生效。
重启期间应用将无法正常提供服务，因此在重启之前，请确保应用已暂停业务请求。
:::

这里我们添加一个 `name` 为 `MY_ENV_KEY`, `value` 为 `MY_ENV_VALUE` 的环境变量，并等待应用重启完成。

![](/doc-images/add-env-step3.png)


## 使用环境变量

环境变量添加完成后，即可在任意云函数中通过访问 `cloud.env` 来使用。

```typescript
import cloud from '@lafjs/cloud'

export async function main(ctx: FunctionContext) {
  
    const env = cloud.env
    console.log(env)
    // 可以看到，我们刚才添加的 MY_ENV_NAME: MY_ENV_VALUE 已经生效了
}

```

