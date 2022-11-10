# laf - app service

## 介绍

`app-service` 是 `laf` 的应用服务引擎：

  - 云函数的执行
  - 数据库访问代理
  - 文件操作

# 安装

> !!!注意：`laf` 服务现需要在 docker 环境下运行，运行方式请参照根目录下的 `README.md`，以下启动方式为老版本遗留，仅做特殊情况下调试时参考。

### 安装依赖

```sh
cd packages/app-server

# 安装依赖（建议使用 node 14+ 或 npm 7.5+，速度更快）
npm install

# 编译
npm run build
```

### 启动 MongoDb

```sh
# 因 app-server 服务用到了 mongodb watch() 功能，要求 mongo 必须用 replica 或 cluster 模式
docker run -p 27017:27017 --name laf_mongo -e ALLOW_EMPTY_PASSWORD=yes -e MONGODB_REPLICA_SET_MODE=primary -e MONGODB_INITIAL_PRIMARY_HOST=localhost  -d bitnami/mongodb
```

### 配置数据库

> 将 .env.development 拷贝并重命名为 .env，编辑里面的环境变量

```sh
# 创建配置文件 .env
cp .env.development .env
```

### 运行

```sh
#运行
npm start
```

## TODO

- 支持 less-api watch() 功能，实现长连接数据流推送
