---
title: 进阶部署 Laf 服务
---

### 进阶部署 Laf 服务

你可能已经看过了 [快速部署文档](./quick.md) ，该方法旨在一键快速部署，通常用于预览目的；

而 [快速部署文档](./quick.md) 在真实的场景会有以下局限：

- 每个应用自带一个 MongoDb 实例，开发者一般希望在一台服务器上启动多个服务
- 快速部署版没有给 MongoDb 设密码，laf 服务也都使用超级管理员访问数据库，有安全隐患，特别是运行多个应用时

本文的部署方式：
- 预先启动一个 MongoDb 实例，以供多个应用使用，并设置 root 密码
- 为每个应用分配数据库和该库对应的用户和密码
- 为每个应用下的 app-server 和 devops-server 分别分配单独的数据库及对应的用户和密码


### 部署指南


> 安装 Docker参考 [快速部署文档](./quick.md)，不再累述。

#### 启动 MongoDb 实例

```sh
# 创建一个 docker network，以供 mongo 与 其它 docker 服务网络互通
docker network create mongo-tier --driver bridge

# 设置 MongoDb root 用户密码（请修改为你的密码）
export MONGODB_ROOT_PASSWORD=SET_YOUR_ROOT_PASSWORD
echo $MONGODB_ROOT_PASSWORD > mongo_root_passwd

# 启动 MongoDb 容器
docker run -d --name mongodb-server --network mongo-tier \
    -e MONGODB_ROOT_PASSWORD=$MONGODB_ROOT_PASSWORD \
    -e MONGODB_REPLICA_SET_MODE=primary \
    -e MONGODB_REPLICA_SET_KEY=replicasetkey123 \
    -e MONGODB_ENABLE_DIRECTORY_PER_DB=yes MONGODB_REPLICA_SET_NAME=rs0 \
    -e MONGODB_INITIAL_PRIMARY_HOST=mongodb-server  \
    -v mongodb-data:/bitnami/mongodb bitnami/mongodb:latest
```

#### 启动一个 laf 应用

> 假设你的应用名为 `my`

为应用创建两个库：
- my-dev-db 存储应用开发数据（用于 `devops server`）
- my-app-db 存储应用数据（用于 `app server`）


```sh
# 进入数据库（先复制这条执行，进入库后再执行之后的）
docker exec -it mongodb-server mongo -u root -p $MONGODB_ROOT_PASSWORD

  # 创建 my-dev-db 库及用户（请修改其用户名密码）
  use my-dev-db;
  db.createUser({ user:"my-dev", pwd:"my_dev_passwd", roles: [ { role: "readWrite", db: "my-dev-db" } ]});

  # 创建 my-app-db 库及用户（请修改其用户名密码）
  use my-app-db;
  db.createUser({ user:"my-app", pwd:"my_app_passwd", roles: [ { role: "readWrite", db: "my-app-db" } ]});

# 退出数据库
exit
```

##### 启动应用
> 保存以下内容至 `docker-compose.yml`

```yml
version: '3.8'
services: 
  devops_server:
    image: lessx/laf-devops-server:latest
    user: node
    environment: 
      SYS_DB: my-dev-db
      SYS_DB_URI: mongodb://my-dev:my_dev_passwd@mongodb-server:27017/?authSource=my-dev-db
      SYS_SERVER_SECRET_SALT: my-devops-server-abcdefg1234567
      SYS_ADMIN: laf-sys
      SYS_ADMIN_PASSWORD: laf-sys
      LOG_LEVEL: debug
      APP_DB: my-app-db
      APP_DB_URI: mongodb://my-app:my_app_passwd@mongodb-server:27017?authSource=my-app-db
      APP_SERVER_SECRET_SALT: my-app-server-abcdefg1234567
    command: dockerize -wait tcp://mongodb-server:27017 npm run init-start
    ports:
      - "9000:9000"
    read_only: false
    cap_drop: 
      - ALL
    tmpfs: 
      - /tmp
    restart: always
    networks: 
      - laf
      - mongo-tier

  app_server:
    image: lessx/laf-app-server:latest
    user: node
    environment: 
      DB: my-app-db
      DB_URI: mongodb://my-app:my_app_passwd@mongodb-server:27017?authSource=my-app-db
      DB_POOL_LIMIT: 100
      SERVER_SECRET_SALT: my-app-server-abcdefg1234567
      LOG_LEVEL: debug
      ENABLE_CLOUD_FUNCTION_LOG: always
    command: dockerize -wait http://devops_server:9000/health-check npm run init-start
    volumes:
      - app-data:/app/data
    ports:
      - "8000:8000"
    read_only: false
    depends_on: 
      - devops_server
    cap_drop: 
      - ALL
    tmpfs: 
      - /tmp
    restart: always
    networks: 
      - laf
      - mongo-tier

  devops_admin:
    image: lessx/laf-devops-admin:latest
    depends_on: 
      - app_server
      - devops_server
    ports: 
      - 8080:80
    networks: 
      - laf

networks:
  laf:
  mongo-tier:
    external: true
      
volumes:
  app-data:
  db-data:
```

启动服务，首次启动会自动拉取 laf 服务镜像，需要数分钟等待：

```sh
# 启动
docker-compose up

# 或 以守护进程方式启动
docker-compose up -d

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
