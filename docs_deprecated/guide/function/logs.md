---
title: 云函数日志
---

# {{ $frontmatter.title }}

日志服务全新升级，极大的优化了性能，让整个云函数性能提升约为 50%

## 旧版日志下线

:::warning
旧版日志已下线，重启升级过的 Laf 应用将不会打印新的日志到旧版日志中。较长时间未重启的过的应用日志仍会打印日志到该区域。
:::

![function-log](/doc-images/old-logs.jpg)

## 全新日志入口

全新日志采用 K8s 原生日志服务，极大的降低了应用在运行时的性能问题。

![function-log](/doc-images/new-logs-1.jpg)

环境变量中新增 `LOG_LEVEL=WARN`，可以忽略 INFO 日志；`LOG_LEVEL=ERROR` 可忽略 INFO 和 WARN 日志

## 自定义日志

旧版日志是通过写数据库实现，虽然已经下线了，关键的日志仍旧可以自己实现日志服务，下面是一个保存日志的例子。

<https://laf.dev/market/templates/654e3740c55209816a74a9be>
