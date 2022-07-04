---
title: 私有化部署
---

## 在 Docker Compose 上部署

### 准备工作

要在 Docker Composer 上部署，你需要准备下面的环境：

- [Docker](https://docs.docker.com/engine/install/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### 获取配置文件

`Laf` 官方仓库提供了一个开箱即用的 Docker Compose 配置文件，你可以直接使用这个现成的配置文件来部署 Laf。

```shell
git clone https://github.com/labring/laf.git
cd laf/deploy/docker-compose
```

在 `/deploy/docker-compose` 目录下提供了一个 `.env` 文件，你可以通过编辑它来修改端口、域名等配置。

### 启动服务

```shell
# 创建一个网络
docker network create laf_shared_network --driver bridge || true

# 拉取 app-service 镜像，否则无法成功创建应用
docker pull lafyun/app-service:latest

# 启动所有服务
docker-compose up

```

接下来浏览器打开 http://console.127-0-0-1.nip.io:8000 就可以看到 Laf 服务的页面了。
