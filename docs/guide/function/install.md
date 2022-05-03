# 安装教程

### 快速部署 `laf.js` 服务

> 基于 Docker Compose 快速部署，需要你熟悉 Docker 以及 docker-compose 的使用。

##### 安装 Docker (CentOS)

> 本例只给出 CentOS 下的安装脚本，若安装其它环境请参考官方文档 https://docs.docker.com/engine/install/。

```sh
sudo yum install -y yum-utils
sudo yum-config-manager \
    --add-repo \
    https://download.docker.com/linux/centos/docker-ce.repo

sudo yum install docker-ce docker-ce-cli containerd.io
sudo systemctl start docker

```

> 还需安装 docker-compose @see https://docs.docker.com/compose/install/。

##### 启动服务（docker-compose）

```sh
git clone https://github.com/lafjs/laf.git

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

### 启动 MongoDB 测试容器

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
