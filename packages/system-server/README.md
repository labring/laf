# laf - system server

## 介绍

`laf-system-server` 是 laf 中负责在线开发和运维应用的服务：

  - 云函数管理
  - 数据访问策略管理
  - 数据库管理：集合与数据管理，备份与恢复
  - 应用状态：启停、指标统计、伸缩

另配套有 `laf-system-client` - LAF 开发运维控制台，提供 Web IDE，在线编写、调试云函数，操作数据库等。


## 安装部署

> !!!注意：`laf` 服务现需要在 docker 环境下运行，运行方式请参照根目录下的 `README.md`，以下启动方式为老版本遗留，仅做特殊情况下调试时参考。

### 安装依赖

```sh
cd packages/system-server

# 安装依赖（建议使用 node 14+）
npm install

# 编译
npm run build
```

### 启动 MongoDb

```sh
# 因 laf-app-server 服务使用到了 mongodb watch() 功能，要求 mongo 必须用 replica 或 cluster 模式
# 若已有 mongo 实例，则跳过此步
docker run -p 27017:27017 --name laf_mongo -e ALLOW_EMPTY_PASSWORD=yes -e MONGODB_REPLICA_SET_MODE=primary -e MONGODB_INITIAL_PRIMARY_HOST=localhost  -d bitnami/mongodb
```

### 配置数据库，并初始化应用

```sh
# 创建配置文件 .env
cp .env.template .env

# 初始化应用数据
npm run init
```

### 运行

```sh
#运行
npm start
```