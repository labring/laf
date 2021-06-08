# less-framework

## 介绍

less-framework 让你开箱即用 less-api， 内置基于角色的权限控制机制（RBAC），多种用户授权方式（密码/微信小程序/公众号/微信开放平台），文件上传，支付接口。

真正实现，服务端超低代码，极速上线应用。

如果你熟悉微信云开发，那 less-framework 就是让你拥有自己的、可独立部署的、开源的、可控的云开发框架。

- 基于 [less-api](https://github.com/Maslow/less-api) 打造的服务端低代码框架
- less-framework 集成了 RBAC、文件上传下载、用户授权，开箱即用，5 分钟上线应用
- [less-admin](https://github.com/Maslow/less-admin) 是 less-framework 配套的后台管理，可管理访问规则、云函数等功能
- 前端可使用 [less-api-client](https://github.com/Maslow/less-api-client-js) “直连”数据库，无需与服务端对接口
- 另有 Flutter SDK [less-api-client](https://github.com/Maslow/less-api-client-dart)，快速上线移动端应用

## 使用

### 安装依赖

```sh
# 下载代码
git clone https://github.com/Maslow/less-framework.git
cd less-framework

# 安装依赖（建议使用 node 14+ 或 npm 7.5+，速度更快）
npm install

# 编译
npm run build
```

### 启动 MongoDb

```sh
docker run -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=less -e MONGO_INITDB_ROOT_PASSWORD=less --name mongo -d mongo
```

### 配置数据库 (MongoDb)

> 【推荐】将 .env.development 拷贝并重命名为 .env，编辑里面的环境变量

```
mv .env.development .env
```

> 【不推荐】或直接修改 `/src/config.ts` 相应配置

### 初始化应用的基础数据

> 初始化管理员、角色、权限、访问规则

```sh
npm run init
```

### 运行

```sh
#运行
npm start
```

> 开发环境可自动编译 ts 代码

```sh
npm run watch
```

> 也可使用 pm2 来运行应用

```sh
# 首次运行前需将 ecosystem.config.js.tpl 重命名为 ecosystem.config.js
mv ecosystem.config.js.tpl ecosystem.config.js

#
pm2 run
```

## TODO

- 支持云函数触发器（定时触发、事件触发、HTTP 触发）
- 支持 less-api watch() 功能，实现长连接数据流推送
- 支持云函数的导入导出（less-admin），可以更好的复用、备份、迁移云函数
- 支持云函数市场，可以更好的分享、复用云函数
- 支持云函数版本管理，可发布版本、历史版本、回滚版本
- 支持 MongoFileStorage，默认将文件存储至 Mongo GridFS（可以更好的利用 Mongo 的分布式、弹性扩展优势）
- 支持阿里云 OSS 存储, AliOssStorage
- 支持在线安装 npm 预设包，可配置云函数执行环境依赖
- 支持本地云函数执行环境，一键调试，一键发版
