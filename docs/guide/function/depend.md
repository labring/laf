---
title: 依赖管理
---

# {{ $frontmatter.title }}

依赖管理可以为应用增加第三方包模块，可以理解为nodejs的`npm install`

## 版本
可以指定依赖版本，默认是最新版`latest`，目前不会自动更新版本，只能在当前应用生效，当前应用下的云函数共享依赖

## 云函数使用

可以直接 `import `,如不生效可以改用`require()`