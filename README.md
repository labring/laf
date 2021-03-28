# less-framework

## 介绍

less-framework 让你开箱即用 less-api， 内置基于角色的权限控制机制（RBAC），多种用户授权方式（密码/微信小程序/公众号/微信开放平台），文件上传，支付接口。

真正实现，服务端超低代码，极速上线应用。

- 基于 [less-api](https://github.com/Maslow/less-api) 打造服务端低代码框架
- less-framework 集成了 RBAC、文件上传下载、用户授权，开箱即用，5分钟上线应用
- 前端可使用 [less-api-client](https://github.com/Maslow/less-api-client-js) “直连”数据库，无需与服务端对接口
- 另有 Flutter SDK [less-api-client](https://github.com/Maslow/less-api-client-dart)，快速上线移动端应用

## 使用
### 安装依赖
```sh
npm install
```

### 启动 MongoDb
```sh
docker run -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=less -e MONGO_INITDB_ROOT_PASSWORD=less --name mongo -d mongo
```

### 配置数据库 (MongoDb)
 `/src/config.ts`

### 初始化应用的基础数据
> 初始化管理员、角色、权限、访问规则
```sh
npm run init
```

### 运行

```sh
npm run build
npm start
```