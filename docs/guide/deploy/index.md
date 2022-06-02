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

同时，在 `/deploy/docker-compose` 目录下还提供了一个 `.env` 文件，你可以通过编辑它来修改端口等配置。

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

### 开发环境下使用

1.  拷贝项目：

```shell
git clone https://github.com/labring/laf.git
cd laf/deploy/docker-compose
```

2.  然后安装项目的依赖：

```shell
npm install
```

3.  接下来，运行开发命令：

```shell
npm run build && npm run watch
```

4.  使用 Docker Compose 启动服务：

```shell
# 创建一个网络
docker network create laf_shared_network --driver bridge || true

# 获取 app-service 镜像
docker pull lafyun/app-service:latest

# 启动服务，这里使用的是根目录的 docker-compose.yml
docker-compose up
```

5.  打开 http://console.127-0-0-1.nip.io:8080 就可以访问服务了
