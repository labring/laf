# less-framework

## 介绍

`less-framework` 是一套开箱即用、完整、开源、可控的云开发框架————真实落地的 serverless 开发方式。

真正实现，服务端超低代码，极速上线应用。

如果你熟悉微信云开发，那 less-framework 就是让你拥有自己的、可独立部署的、开源的、可控的云开发框架。

### 重要相关
  - 基于 [less-api](https://github.com/Maslow/less-api) 打造的服务端低代码框架
  - less-framework 集成了 RBAC、文件上传下载、用户授权，开箱即用，5 分钟上线应用
  - [less-admin](https://github.com/Maslow/less-admin) 是 less-framework 配套的后台管理，可管理访问规则、云函数等功能
  - 前端可使用 [less-api-client](https://github.com/Maslow/less-api-client-js) “直连”数据库，无需与服务端对接口
  - 另有 Flutter SDK [less-api-client](https://github.com/Maslow/less-api-client-dart)，快速上线移动端应用

## 初心场景

- 用于快速开发 MVP，专注于客户端业务，极大程度减少服务端开发工作量
- 自建属于自己的云开发环境

> 想了解云开发：[微信云开发](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)、[Uni-Cloud云开发](https://uniapp.dcloud.net.cn/uniCloud/README)


## 谁适合使用 less-framework ？

### 云开发用户（微信云开发/阿里云开发/uni-cloud云开发/Google FireBase等）

    如果你喜欢微信云开发的极速开发体验，但又不想局限于微信等具体平台的限制，
    那么可以基于 less-framework 搭建属于自己的云开发平台；

    `less-framework` 也是当前已知的唯一的开源云开发项目，相比于大厂直接提供「云开发服务」，
    `less-framework` 是直接提供「开源云开发框架」，技术选型更自信、风险更可控、场景更易扩展；

    自建云开发，可以获取极速的云开发体验，同时没有技术选型时迁移平台的烦恼顾虑。


### 个人开发者、初创创业团队

    无论你使用云开发还是自建服务器环境，在产品初期基于 `less-framework` 可以极大减少服务端API的数量，
    根据我们的实践经验，初期能节约 90% 的服务端API。

    因此，在产品初期，团队可以专注于产品业务本身，快速推出最小可用产品(MVP)，快速进行产品、市场验证。

    随着业务的发展，可将部分事务、性能、安全敏感的 API 用传统方式实现，`less-framework` 继续承担一般的数据请求。

    即便是应用重构，也可逐个替换原 `less-framework` 负责的请求，重构过程不影响应用正常运行，持续发布的方式重构。


# 使用说明

> 有以下两种方式: `基于 Docker Compose 快速部署` 和 `手动安装部署`
## 基于 Docker Compose 快速部署

```
git clone https://github.com/Maslow/less-framework.git
cd less-framework

docker-compose up
```

> 另，[less-admin](https://github.com/Maslow/less-admin) 是 less-framework 配套的后台管理，可管理访问规则、云函数等功能

## 手动安装部署

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

> 开发环境可自动编译

```sh
npm run watch
```

### 启动 MongoDb

```sh
docker run -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=less -e MONGO_INITDB_ROOT_PASSWORD=less --name mongo -d mongo
```

### 配置数据库 (MongoDb)

> A.【推荐】将 .env.development 拷贝并重命名为 .env，编辑里面的环境变量

```
mv .env.development .env
```

> B.【不推荐】或直接修改 `/src/config.ts` 相应配置

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

> 也可使用 pm2 来运行应用

```sh
# 首次使用 pm2 运行前，需将创建配置文件 ecosystem.config.js
cp ecosystem.config.js.tpl ecosystem.config.js

pm2 run
```

## TODO

- 支持云函数触发器（定时触发、事件触发）【已完成】
- 支持 less-api watch() 功能，实现长连接数据流推送
- 支持云函数版本管理，可发布版本、历史版本、回滚版本
- 支持 MongoFileStorage，默认将文件存储至 Mongo GridFS（可以更好的利用 Mongo 的分布式、弹性扩展优势）
- 支持在线安装 npm 预设包，可配置云函数执行环境依赖
