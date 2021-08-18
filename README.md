# LaF 云开发框架

## 介绍

`LaF` 是一套开箱即用、完整、开源、可控的云开发框架。

真正实现，服务端超低代码，极速上线应用，提供云函数引擎————可在线编程、全类型提示、在线调试、一键部署运行，提供客户端“直连”数据库的访问策略。

如果你熟悉微信云开发，那 `LaF` 就是让你拥有自己的、可独立部署的、开源的、可控的云开发框架。

### 重要相关

  - 基于 [less-api](https://github.com/Maslow/less-api) 打造的服务端低代码框架
  - `LaF` 集成了云函数引擎、RBAC、文件上传下载、用户授权，开箱即用，5 分钟上线应用，前端开发立即变全栈开发
  - 前端可使用 [less-api-client](https://github.com/Maslow/less-api-client-js) “直连”数据库，无需与服务端对接口
  - 另有 Flutter SDK [less-api-client](https://github.com/Maslow/less-api-client-dart)，快速上线移动端应用
  - 支持 h5、小程序、Uni-app、Flutter 等客户端环境使用

## 初心场景

- 用于快速开发 MVP，专注于客户端业务，极大程度减少服务端开发工作量
- 自建属于自己的云开发环境

> 想了解云开发：[微信云开发](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)、[Uni-Cloud云开发](https://uniapp.dcloud.net.cn/uniCloud/README)


## 谁适合使用 `LaF` ？

### 云开发用户（微信云开发/阿里云开发/uni-cloud云开发/Google FireBase等）

    如果你喜欢微信云开发的极速开发体验，但又不想局限于微信等具体平台的限制，
    那么可以基于 `LaF` 搭建属于自己的云开发平台；

    `LaF` 也是当前已知的唯一的开源云开发项目，相比于大厂直接提供「云开发服务」，
    `LaF` 是直接提供「开源云开发框架」，技术选型更自信、风险更可控、场景更易扩展；

    自建云开发，可以获取极速的云开发体验，同时没有技术选型时迁移平台的烦恼顾虑。


### 个人开发者、初创创业团队

    无论你使用云开发还是自建服务器环境，在产品初期基于 `LaF` 可以极大减少服务端API的数量，
    根据我们的实践经验，初期能节约 90% 的服务端API。

    因此，在产品初期，团队可以专注于产品业务本身，快速推出最小可用产品(MVP)，快速进行产品、市场验证。

    随着业务的发展，可将部分事务、性能、安全敏感的 API 用传统方式实现，`LaF` 继续承担一般的数据请求。

    即便是应用重构，也可逐个替换原 `LaF`负责的请求，重构过程不影响应用正常运行，持续发布的方式重构。


## 运行截图

![](https://s3.bmp.ovh/imgs/2021/08/c93516996b7e4d70.png)
![](https://s3.bmp.ovh/imgs/2021/08/fd8e63c2dcb57859.png)
![](https://s3.bmp.ovh/imgs/2021/08/76814bb1f306a9bd.png)
![](https://s3.bmp.ovh/imgs/2021/08/3de1eba8e3996177.png)
![](https://s3.bmp.ovh/imgs/2021/08/dbd180ca0118f2d8.png)
![](https://s3.bmp.ovh/imgs/2021/08/ac3b3730f929cd32.png)
![](https://s3.bmp.ovh/imgs/2021/08/2edfa0f64da290f3.png)
![](https://s3.bmp.ovh/imgs/2021/08/3f42df664f374f0d.png)
![](https://s3.bmp.ovh/imgs/2021/08/34be691191a6ff42.png)
![](https://s3.bmp.ovh/imgs/2021/08/8cba6afa35769000.png)
![](https://s3.bmp.ovh/imgs/2021/08/8db31036f2fb17f1.png)
![](https://s3.bmp.ovh/imgs/2021/08/e5ed0732680f6ed1.png)

## 使用说明

### 基于 Docker Compose 快速部署

#### 安装 Docker & Docker Compose (CentOS)

```sh
sudo yum install -y yum-utils
sudo yum-config-manager \
    --add-repo \
    https://download.docker.com/linux/centos/docker-ce.repo

sudo yum install docker-ce docker-ce-cli containerd.io
sudo systemctl start docker

```

@see https://docs.docker.com/engine/install/
@see https://docs.docker.com/compose/install/

#### 启动

```sh
git clone https://github.com/Maslow/less-framework.git
cd less-framework

# 启动所有服务
docker-compose up

# 浏览器打开 http://locahost:8080 访问

# 停止服务
docker-compose down

# 停止服务并清数据卷
docker-compose down -v

# 更新镜像
docker-compose pull

```

# TODO

- 提供在线演示版
- 提供在线开发文档