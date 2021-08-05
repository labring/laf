# less-framework

## 介绍

`less-framework` 是一套开箱即用、完整、开源、可控的云开发框架————真实落地的 serverless 开发方式。

真正实现，服务端超低代码，极速上线应用。

如果你熟悉微信云开发，那 less-framework 就是让你拥有自己的、可独立部署的、开源的、可控的云开发框架。

### 重要相关
  - 基于 [less-api](https://github.com/Maslow/less-api) 打造的服务端低代码框架
  - less-framework 集成了 RBAC、文件上传下载、用户授权，开箱即用，5 分钟上线应用
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


## 运行截图

![](https://s3.bmp.ovh/imgs/2021/08/9ade3cec7ba8bb0a.png)
![](https://s3.bmp.ovh/imgs/2021/08/5faa3eb4943acd55.png)
![](https://s3.bmp.ovh/imgs/2021/08/25c2e4298719f9aa.png)
![](https://s3.bmp.ovh/imgs/2021/08/1216a79b03d17a12.png)
![](https://s3.bmp.ovh/imgs/2021/08/bb2b4d2e3100d00d.png)
![](https://s3.bmp.ovh/imgs/2021/08/44a349008ec52d1f.png)

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

# 因 mongo 启动较慢，所以先启动 mongo 服务
docker-compose up -d mongo

# 主动等待数秒后，启动所有服务
docker-compose up

# 浏览器打开 http://locahost:8080 访问
```

#### 停止

```sh
docker-compose down
```

#### 更新最新镜像

```sh
docker-compose pull
```

# TODO

- 提供在线演示版
- 提供在线使用文档