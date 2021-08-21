# LaF 云开发框架

在线开发文档：https://laf.laogen.site/

## 介绍

`LaF` 是一套开箱即用、完整、开源、为开发者提供的基于 serverless 模式和 js 编程的云开发框架。

用熟悉的 js，轻松搞定前后台整体业务，前端秒变全栈。

### 主要内容

  - 提供云函数引擎、文件存储、数据访问策略，开箱即用，5 分钟上线应用，前端秒变全栈
  - 前端可使用 [less-api-client sdk](https://github.com/Maslow/less-api-client-js) “直连”数据库，无需与服务端对接口
  - 另有 Flutter SDK [less-api-client](https://github.com/Maslow/less-api-client-dart)，快速上线移动端应用
  - 支持 h5、小程序、Uni-app、Flutter 等客户端环境使用
  - 提供云开发控制台，在线管理云函数、文件、数据库、远程部署、日志，在线编写、调试云函数，全智能提示IDE

### 初心场景

- 用于快速开发 MVP，专注于客户端业务，极大程度减少服务端开发工作量
- 自建属于自己可控的云开发环境

> 想了解云开发：[微信云开发](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)


## 谁适合使用 ？

### 云开发用户

  如果你喜欢微信云开发的极速体验，但又不想局限于微信等具体平台的限制，那么可以基于 `LaF` 搭建属于自己的云开发平台；

  - `LaF` 也是当前已知的唯一的开源云开发项目，相比于大厂直接提供「云开发服务」，
  - `LaF` 是直接提供「开源云开发框架」，技术选型更自信、风险更可控、场景更易扩展；
  - 自建云开发，可以获取极速的云开发体验，同时没有技术选型时迁移平台的烦恼顾虑。


### 个人开发者、初创创业团队

  在产品初期基于 `LaF` 可以极大减少服务端API的数量；

  根据我们的实践经验，初期能节约 90% 的服务端API；

  专注于产品业务本身，快速推出最小可用产品(MVP)，快速进行产品、市场验证。

### 软件开发商

  将无需雇佣php或java等服务器工程师，开发成本大幅下降；
  
  开发效率大幅提升、上线和迭代速度大幅提速；

  可完整交付整个云开发框架源码，私网部署；

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

### 快速部署 LaF 服务

> 基于 Docker Compose 快速部署，需要你熟悉 docker 以及 docker-compose 的使用

##### 安装 Docker  (CentOS)

> 本例只给出 CentOS 下的安装脚本，若安装其它环境请参考官方文档 https://docs.docker.com/engine/install/

```sh
sudo yum install -y yum-utils
sudo yum-config-manager \
    --add-repo \
    https://download.docker.com/linux/centos/docker-ce.repo

sudo yum install docker-ce docker-ce-cli containerd.io
sudo systemctl start docker

```

> 还需安装 docker-compose @see  https://docs.docker.com/compose/install/

##### 启动服务

```sh
git clone https://github.com/Maslow/less-api-framework.git
cd less-api-framework

# 启动所有服务
docker-compose up

# 浏览器打开 http://locahost:8080 访问

```

##### 停止服务

```sh
# 停止服务
docker-compose down

# 停止服务并清数据卷
docker-compose down -v
```

##### 更新服务镜像

```sh
# 更新镜像
docker-compose pull
```