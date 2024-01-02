---
title: laf assistant (非官方维护)
---

# {{ $frontmatter.title }}

`laf assistant` 为社区用户 `白夜` 由于兴趣开发。基于 `laf-cli` 封装开发而成。

详细介绍可看：[Laf Assistant：云开发从未如此爽快！](https://mp.weixin.qq.com/s/SueTSmWFXDySaRSx3uAPIg)

## 应用安装

`VSCode` 应用中直接搜索 `laf assistant` 或点击链接[在线安装](https://marketplace.visualstudio.com/items?itemName=NightWhite.laf-assistant)

:::tip
使用`laf assistant`需 node 版本大于等于 18

node version >= 18
:::

## VSCode 设置修改

设置中搜索`typescript.preferences.importModuleSpecifier`，改成`non-relative`

## 初始化

在对接到 Laf 云开发的前端项目中新建目录 `laf-cloud`

在`laf-cloud`上右键点击登录。

需要配置 Laf 应用的相关信息，包括 `apiurl`、`pat` 和 `appid`

- `apiurl` 当前登录的 Laf 网址前面添加 `api`。如：`https://api.laf.dev`

- `pat` pat 获取方式可查看 [laf-cli 文档](/guide/cli/#登录)

- `appid` Laf 应用 appid 可查看[Web IDE 介绍](/guide/web-ide/#应用管理)

:::warning
`laf assistant`默认会自动安装`laf-cli`，如果出现自动安装失败的情况，可以[手动安装 laf-cli](/guide/cli/#安装)
:::

都填完后，重新在`laf-cloud`上右键点击登录。右下角会提示登录成功。

登录成功后，继续在`laf-cloud`上右键点击初始化。即完成初始化工作。

:::warning
初始化成功后，会在`laf-cloud`目录中初始化很多文件，请不要随意删除
:::

## 同步线上依赖

在 Laf 应用安装的依赖，可通过同步线上依赖的方式下载到本地，仅为方便开发时查看代码提示，可不同步，不参与编译或代码运行。如果线上增加了新的依赖，可再执行一次。

## 发布/下载全部云函数

登录并初始化后，在`laf-cloud`文件夹上右键，发布/下载全部云函数。

## 新增云函数

在`laf-cloud`文件夹上右键，新增云函数。

## 操作单个云函数

打开`laf-cloud/functions`，任意打开一个云函数，在编辑框右键即可 `发布/下载/运行` 当前云函数。可在 `VSCode` 设置里自定义快捷键，操作更加方便。

## 其他功能

其他 `laf-cli` 功能暂未添加，可在终端输入 `laf -h` 查看，也可直接查看 [laf-cli 文档](/guide/cli/)
