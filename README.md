# laf.js 云开发框架

在线文档：https://docs.lafyun.com/

在线体验：https://www.lafyun.com/

## 介绍

`laf.js` 是一套开箱即用、完整、开源、为开发者提供的基于 serverless 模式和 js 编程的云开发框架。

用熟悉的 js，轻松搞定前后台整体业务，前端秒变全栈。

[`laf.js`](https://github.com/lafjs/laf) 让每个开发团队都可以随时拥有一个自己的云开发平台！


**交流 QQ 群：`603059673`**

---

> [lafyun.com](http://www.lafyun.com) 正式上线！可直接在线体验，[立即创建](http://www.lafyun.com) laf 云开发应用服务！

> 开发者可免费在 [lafyun.com](http://www.lafyun.com) 上快速创建自己的应用，不用关心服务器部署和运维工作，立即拥有应用独立域名及 HTTPS 证书，快速上线应用！

> 开发者可以在私有服务器上部署一套 laf 云开发平台，可方便的将 [lafyun.com](http://www.lafyun.com) 中的应用迁至自己的 laf 云开发平台中运行！

---

### 主要内容

- 提供云函数引擎、文件存储、数据访问策略、触发器、WebSocket 等能力，开箱即用，5 分钟上线应用，前端秒变全栈
- 前端可使用 [laf-client-sdk](https://github.com/lafjs/laf/tree/main/packages/client-sdk) “直连”数据库，无需与服务端对接口
- 另有 Flutter SDK [less-api-client](https://github.com/Maslow/less-api-client-dart)，快速上线移动端应用
- 支持 h5、小程序、Uni-app、Flutter 等客户端环境使用
- 提供云开发控制台，在线管理云函数、文件、数据库、远程部署、日志，在线编写、调试云函数，全智能提示 IDE

### 初心场景

- 用于快速开发 MVP，专注于客户端业务，极大程度减少服务端开发工作量
- 自建属于自己可控的云开发平台

## 谁适合使用 ？

### 云开发用户

如果你喜欢微信云开发的极速体验，但又不想局限于微信等具体平台的限制，那么可以基于 `LaF` 搭建属于自己的云开发平台；

- `laf.js` 也是当前已知的唯一的开源云开发平台，技术选型更自信、风险更可控、场景更易扩展
- 自建云开发，可以获取极速的云开发体验，同时没有技术选型时迁移平台的烦恼顾虑

### 个人开发者、初创创业团队

在产品初期基于 `laf.js` 可以极大减少服务端 API 的数量；

根据我们的实践经验，初期能节约 90% 的服务端 API；

专注于产品业务本身，快速推出最小可用产品(MVP)，快速进行产品、市场验证。

### 软件开发商

将无需雇佣 php 或 java 等服务器工程师，开发成本大幅下降；

开发效率大幅提升、上线和迭代速度大幅提速；

可完整交付整个云开发框架源码，私网部署；

## 运行截图

应用列表
![](https://9b069020-06e3-4949-83d9-992a52ca99fe_laf_preview_screens.fs.lafyun.com/apps.png)

云函数列表
![](https://9b069020-06e3-4949-83d9-992a52ca99fe_laf_preview_screens.fs.lafyun.com/functions.png)

在线开发云函数
![](https://9b069020-06e3-4949-83d9-992a52ca99fe_laf_preview_screens.fs.lafyun.com/ide.png)

云存储：文件管理
![](https://9b069020-06e3-4949-83d9-992a52ca99fe_laf_preview_screens.fs.lafyun.com/files.png)

云数据库：数据管理
![](https://9b069020-06e3-4949-83d9-992a52ca99fe_laf_preview_screens.fs.lafyun.com/collection.png)

云数据库：访问策略
![](https://9b069020-06e3-4949-83d9-992a52ca99fe_laf_preview_screens.fs.lafyun.com/policy.png)

远程部署
![](https://9b069020-06e3-4949-83d9-992a52ca99fe_laf_preview_screens.fs.lafyun.com/deploy.png)

协作成员
![](https://9b069020-06e3-4949-83d9-992a52ca99fe_laf_preview_screens.fs.lafyun.com/member.png)

## 使用说明

### 快速部署 `laf.js` 服务

> 基于 Docker Compose 快速部署，需要你熟悉 docker 以及 docker-compose 的使用

##### 安装 Docker (CentOS)

> 本例只给出 CentOS 下的安装脚本，若安装其它环境请参考官方文档 https://docs.docker.com/engine/install/

```sh
sudo yum install -y yum-utils
sudo yum-config-manager \
    --add-repo \
    https://download.docker.com/linux/centos/docker-ce.repo

sudo yum install docker-ce docker-ce-cli containerd.io
sudo systemctl start docker

```

> 还需安装 docker-compose @see https://docs.docker.com/compose/install/

##### 启动服务（docker-compose）

```sh
git clone https://github.com/lafjs/laf.git

# 该目录下有更多部署脚本，可供生产部署时使用
cd laf/deploy/docker-compose

docker network create laf_shared_network --driver bridge || true
docker pull lafyun/app-service:latest

# 启动所有服务
docker-compose up

# 浏览器打开 http://console.local-dev.host:8000 访问
```

### 开发环境（开发者）

```sh
# install dependencies
npm install

# build & watch packages
npm run build && npm run watch

# create a shared network in docker
docker network create laf_shared_network --driver bridge || true

# download the app service image
docker pull lafyun/app-service:latest

# launch laf.js services
docker-compose up

# Now open http://console.local-dev.host:8080 in your browsers!

```

> TIPs: 
> We provide `*.local-dev.host` always resolved to `127.0.0.1` anywhere! 
> Close your VPN then `local-dev.host` resolving works well. 


## 测试用例

### 启动 mongodb 测试容器

```sh
docker run --rm -p 27018:27017 --name mongotest -d mongo
```

### 运行测试

```sh
# 运行测试用例
npx mocha ./packages/*/tests/**/*.test.js

# 清除测试容器
docker rm -f mongotest
```
