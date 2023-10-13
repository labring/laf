---
title: 云函数历史日志
---

# {{ $frontmatter.title }}

:::warning
只有在云函数中加 `consol` 打印才会保存日志！
:::

云函数的会在日志板块中查看

可根据请求 ID `requestId` 和云函数名筛选

目前的保存策略是保留最新的 10000 条日志，不支持手动删除

![function-log](/doc-images/function-log.png)

1、点击日志，切换到日志板块

2、可根据 `requestId` 和云函数名搜索指定日志

3、点击单个日志，可查看详细内容
