## 安装教程

### 快速部署 `laf`

> 基于 Docker Compose 快速部署，需要你熟悉 Docker 以及 Docker Compose 的使用。

##### 安装 Docker

- 安装 Docker: https://docs.docker.com/engine/install/
- 安装 Docker Compose: https://docs.docker.com/compose/install/

##### 启动服务（docker-compose）

```sh
git clone https://github.com/labring/laf.git

cd laf/deploy/docker-compose

docker network create laf_shared_network --driver bridge || true

# 启动所有服务
docker-compose up

# 浏览器打开 http://console.127-0-0-1.nip.io:8000 访问
```

## FQA

1. 修改域名或端口，可直接编辑 `.env` 文件

2. Console 响应 `502` 怎么办？
   a. 是否通过 IP 访问？laf 强依赖域名，只可通过 `.env` 里配置的域名访问，不能通过 IP 访问
   b. 查看 gateway 日志，查看是否有错误信息：`docker-compose logs -f gateway`
   c. 是否开启了 VPN？ 本地运行可能需要关闭 VPN。

3. 无法连接数据库？
   a. 查看 mongodb 日志：`docker-compose logs -f mongodb`，看是否启动成功？
   b. 苹果 M1 芯片暂不支持 mongo 5.0，需要修改为 4.4 版本：bitnami/mongodb:4.4.13
   c. 部分老 intel 处理器不支持 mongo 5，需要修改为 4.4 版本：bitnami/mongodb:4.4.13
   d. 可能由于 MongoDb 首次启动初始化时间较长，导致其它服务连接超时，尝试重启服务：`docker-compose restart system-server instance-contro ller`

4. 尝试重启所有服务？
   a. 不清除数据重启：`docker-compose down && docker-compose up`
   b. 清除数据重启： `docker-compose down -v && docker-compose up`
