---
title: 云函数入门
---

# {{ $frontmatter.title }}

云函数是运行在云端的 JavaScript 代码。

云函数可使用 Typescript 编写，无需管理服务器，在开发控制台在线编写、在线调试、一键保存即可运行后端代码。

在你的应用中，大多数数据的获取都可在客户端直接操作数据库，但是通常业务中会使用到「非数据库操作」，如注册、登录、文件操作、事务、第三方接口等，可直接使用云函数实现。

## 创建云函数

点击页面左上角「函数」按钮,点击加号,添加云函数

![](/doc-images/create-function.png)

## 编辑云函数

可直接在线编辑代码

![](/doc-images/edit-cloudfunction.png)

## 运行云函数

云函数可直接运行调试,未发布的云函数也可以在此进行运行调试

![](/doc-images/run-cloudfunction.png)

## 发布云函数

云函数发布后,才可正式使用

::: warning
云函数不会自动保存,发布后才会保存并生效
:::

![](/doc-images/publish-cloudfunction.png)