# Laf web 贡献者快速上手文档

## Install dependencies and Start

```bash
pnpm install
pnpm run dev
```

### 登陆重定向不到本地的问题

d此外，由于 `laf` 的登录认证是接入的 `casdoor`, 登录后的回跳地址是固定的，需要我们手动修改为 `localhost:3001`, 也即我们本地的服务器。修改完后回车，再进行登录即可跳回 `localhost:3001`

![](./images/change-redirect-uri.png)



# 相关框架简介

## 基础框架: react

## 数据请求：react-query + axios

1. 链接：

[Overview | TanStack Query Docs](https://tanstack.com/query/v4/docs/react/overview)

1. 为什么使用react-query?

[refactor: react query best practice  by LeezQ · Pull Request #496 · labring/laf](https://github.com/labring/laf/pull/496#issue-1482332711)

1. 用法参考： web\src\pages\app\functions\service.ts

    在本项目中对于每个页面都会存在service.ts文件用于管理当前页面内的请求


## 状态管理：zustand + immer

1. 链接：

[Zustand](https://zustand-demo.pmnd.rs/)

1. 用法参考: web\src\pages\app\functions\store.ts

    项目的全局状态管理： web\src\pages\globalStore.ts

    每个页面的状态管理：存放在对应的store.ts中


## UI库：chakra

1. 链接：

[Installation](https://chakra-ui.com/getting-started)

1. 自定义样式要修改：web/src/chakraTheme.ts

## 样式: tailwind (主要)+ sass

1. 链接：

[Tailwind CSS - Rapidly build modern websites without ever leaving your HTML.](https://tailwindcss.com/)

1. 自定义样式要修改：web/tailwind.config.cjs

## 国际化:i18next

1. 链接：

[Introduction](https://www.i18next.com/)

1. 国际化文案: web/public/locales
2. 使用方法：

3.1 直接写t(”test”),鼠标hover上去后会出现如下提示框

![](./images/translate-1.png)

3.2 点击zh-CN后面的编辑icon会出现如下输入框，输入后回车就完成了zh-CN文本的翻译
![](./images/translate-2.png)

3.3 在所有编码结束后点击编辑器的翻译插件，可以看到EN和ZH有缺失的翻译文案，点击地球icon即可完成自动翻译
![](./images/translate-0.png)

## ICON：react-icons + 自定义icon

1. 链接:

[React Icons](https://react-icons.github.io/react-icons/)

1. 自定义ICON使用@chakra-ui/icons

# 提PR流程

[三分钟学会参与开源，提交 pr | 左风的博客](https://zuofeng59556.github.io/my-blog/pages/quickStart/pr/)
