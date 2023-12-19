---
title: 云函数日志
---

# {{ $frontmatter.title }}

## 日志入口

日志采用 K8s 原生日志服务，极大的降低了应用在运行时的性能问题。

![function-log](../doc-images/new-logs-1.jpg)

环境变量中新增 `LOG_LEVEL=WARN`，可以忽略 INFO 日志；`LOG_LEVEL=ERROR` 可忽略 INFO 和 WARN 日志

