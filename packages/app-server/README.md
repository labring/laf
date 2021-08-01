# laf - app server

## 介绍

`laf-devops-server` 是 less api framework 中的应用服务引擎：

  - 云函数的执行
  - 数据访问
  - 文件操作

# 安装

### 安装依赖

```sh
# 下载代码
git clone https://github.com/Maslow/less-framework.git
cd less-framework/packages/app-server

# 安装依赖（建议使用 node 14+ 或 npm 7.5+，速度更快）
npm install

# 编译
npm run build
```

### 启动 MongoDb

```sh
# 因 laf-app-server 服务使用到了 mongodb watch() 功能，要求 mongo 必须用 replica 或 cluster 模式
docker run -p 27017:27017 --name laf_mongo -e ALLOW_EMPTY_PASSWORD=yes -e MONGODB_REPLICA_SET_MODE=primary -e MONGODB_INITIAL_PRIMARY_HOST=localhost  -d bitnami/mongodb
```

### 配置数据库，并初始化应用

> 将 .env.development 拷贝并重命名为 .env，编辑里面的环境变量

```sh
# 创建配置文件 .env
cp .env.development .env

# 初始化管理员、访问策略、云函数等数据
npm run init
```

### 运行

```sh
#运行
npm start

```

## TODO

- 支持 less-api watch() 功能，实现长连接数据流推送
- 支持 MongoFileStorage，默认将文件存储至 Mongo GridFS（可以更好的利用 Mongo 的分布式、弹性扩展优势）
- 支持在线安装 npm 预设包，可配置云函数执行环境依赖
