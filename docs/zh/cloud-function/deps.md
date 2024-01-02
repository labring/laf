

# 依赖包管理

本节介绍应用的依赖包管理，laf 应用支持添加三方的 npm packages。

::: info 本节目录
[[toc]]
:::

应用的依赖分为两种：
- 自定义依赖，是开发者为应用主动添加的依赖
- 内置依赖，是运行时中自带的依赖，无需安装

## 自定义依赖

应用添加的`自定义依赖`包在运行时内部，会存储在一个单独的目录下， 与`内置依赖`不在同一目录。

`自定义依赖` 的加载优先级会高于 `内置依赖`，即你可以添加一个`内置依赖`中已存在的依赖包，云函数会优先加载你添加的依赖版本。

自定义依赖的添加和管理，在「laf 应用开发控制台」中云函数列表的下方，可根据页面对应的操作来完成自定义依赖的管理，不再赘述。

## 内置依赖


**此表中依赖项及其版本，可能并不会随着迭代及时更新，知悉。**

```json
{
  "@aws-sdk/client-s3": "^3.468.0",
  "@aws-sdk/client-sts": "^3.468.0",
  "@aws-sdk/s3-request-presigner": "^3.468.0",
  "@kubernetes/client-node": "^0.18.0",
  "@lafjs/cloud": "^1.0.0-beta.14",
  "@types/pako": "^2.0.2",
  "axios": "^1.4.0",
  "chalk": "^4.1.2",
  "chatgpt": "^5.2.5",
  "cors": "^2.8.5",
  "database-proxy": "^1.0.0-beta.14",
  "dayjs": "^1.11.7",
  "dotenv": "^8.2.0",
  "ejs": "^3.1.8",
  "express": "^4.18.2",
  "express-http-proxy": "^2.0.0",
  "express-xml-bodyparser": "^0.3.0",
  "jsonwebtoken": "^9.0.0",
  "lodash": "^4.17.21",
  "minio": "^7.0.32",
  "mongodb": "^5.9.2",
  "mongodb-uri": "^0.9.7",
  "multer": "^1.4.5-lts.1",
  "node-modules-utils": "^1.0.0-beta.14",
  "nodemailer": "^6.6.3",
  "pako": "^2.1.0",
  "validator": "^13.7.0",
  "ws": "^8.11.0"
}
```

## 依赖缓存

在应用启动时，运行时会自动运行 `npm install` 指令安装依赖，在首次安装成功后，会将已安装的依赖目录打包缓存到云存储中。

后续再重启/启动应用时，会自动使用缓存，从而大大减少启动时间。

Laf 会自动为每个应用自动创建一个 `cloud-bin` 的文件桶，依赖缓存文件会自动上传到该文件桶中，文件名为 `node_modules.tar`。

开发者如果主动删除 `node_modules.tar` 文件，则下次启动的时候会重新安装依赖并缓存。

开发者如果主动删除 `cloud-bin` 文件桶，则下次启动时 laf 会自动创建该文件桶。

## 离线使用

如果开发者需要在完全离线的环境下，无法使用在线的 npm registry 服务，即无法执行 `npm install` 进行依赖安装，可通过以下方式完成离线使用：

- 在有网环境中将要使用的依赖打包为 `node_modules.tar`，并上传到 `cloud-bin` 文件中，以缓存的方式提供给运行时
- 给应用添加 `LF_NODE_MODULES_CACHE=always` 环境变量，以控制运行时跳过执行 `npm install` 操作


## 下一步
::: tip
- [发起网络请求](./fetch.md)
- [环境变量](./env.md)
- [云数据库](../cloud-database/index.md)
- [云存储](../cloud-storage/index.md)
- [函数引用](./import.md)
:::