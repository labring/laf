---
title: laf-cli 命令行工具
---

# {{ $frontmatter.title }}


## 简介

`laf-cli` 提供本地开发环境相关能力的支持：

- 云函数：支持在本地运行、拉取、部署云函数
- 云存储：支持从本地上传、下载云存储文件
- 应用：初始化、查看、启动、停止应用服务


## 安装

```bash
# 要求  node 版本 >= 16
npm i laf-cli -g
```


## 登录

```bash
laf login -u username -p password
```

默认登录 `lafyun.com`，如果要登录私有部署的 laf 可通过 `-r` 参数指定：
  
`laf login -u username -p password -r https://console.lafyun.com`


## 查看应用列表

```bash
laf list
```


## 启停应用

```bash
# 启动应用
laf start APPID

# 停止应用
laf stop APPID

# 重启应用
laf restart APPID
```


## 在本地初始化应用

在你的本地项目目录下执行：

```bash
laf init -s APPID
```

执行后会在当前目录生成一个文件夹 `@laf`，该文件夹下包含了 laf 应用的云函数代码等文件。

`-s` 参数指定初始化时从远程拉取云函数代码，如果不指定，则只会同步应用的基本信息。

`APPID` 应是你已经创建应用的 ID，可通过 `laf list` 查看。


## 拉取云函数

从远程拉取云函数到本地：

```bash

# 拉取所有云函数
laf fn pull 

# 拉取一个云函数
laf fn pull FUNCTION_NAME

```


## 推送云函数

推送本地云函数到远程：

```bash

# 推送所有云函数
laf fn push

# 推送一个云函数
laf fn push FUNCTION_NAME

```


## 调试云函数

用于调试「未保存」「未发布」的云函数：

```bash

```bash
laf fn invoke FUNCTION_NAME --param '{"name": "laf"}'
```


## 发布云函数

发布云函数：

```bash
laf fn publish FUNCTION_NAME
```

## 上传云存储文件

将本地目录 `./dist/` 内的文件上传到 `www` Bucket 中：

```bash
laf oss push ./dist/ www
```

## 下载云存储文件

下载云存储 bucket 内的文件到本地：

```bash
laf oss pull www ./dist/
```


## 其它说明

1. laf cli 还不支持查看应用/云函数日志，正在开发中；
2. laf cli 版本不稳定，以上文档可能更新并不及时，可通过  `laf -h` `laf fn pull -h` 来查看具体说明；
3. laf cli 从 laf 0.8.5 开始支持，`system-server` 服务版本低于 0.8.5 不支持 laf cli；