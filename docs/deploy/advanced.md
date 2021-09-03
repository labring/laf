---
title: 进阶部署 Laf 服务
---

## 进阶部署 Laf 服务

你可能已经看过了 [快速部署文档](./quick.md) ，该方法旨在一键快速部署，通常用于预览目的；

而 [快速部署文档](./quick.md) 在真实的场景会有以下局限：

- 每个应用自带一个 MongoDb 实例，开发者一般希望在一台服务器上启动多个服务
- 快速部署版没有给 MongoDb 设密码，laf 服务也都使用超级管理员访问数据库，有安全隐患，特别是运行多个应用时

本文的部署方式：
- 预先启动一个 MongoDb 实例，以供多个应用使用，并设置 root 密码
- 为每个应用分配数据库和该库对应的用户和密码
- 为每个应用下的 app-server 和 devops-server 分别分配单独的数据库及对应的用户和密码


## 部署指南


> 安装 Docker参考 [快速部署文档](./quick.md)，不再累述。

### 启动 MongoDb 实例

```sh
# 创建一个 docker network，以供 mongo 与 其它 docker 服务网络互通
docker network create mongo-tier --driver bridge

# 设置 MongoDb root 用户密码（请修改为你的密码）
export MONGODB_ROOT_PASSWORD=SET_YOUR_ROOT_PASSWORD

# 启动 MongoDb 容器
docker run -d --name mongodb-server --network mongo-tier \
    -e MONGODB_ROOT_PASSWORD=$MONGODB_ROOT_PASSWORD \
    -e MONGODB_REPLICA_SET_MODE=primary \
    -e MONGODB_REPLICA_SET_KEY=replicasetkey123 \
    -e MONGODB_ENABLE_DIRECTORY_PER_DB=yes -e MONGODB_REPLICA_SET_NAME=laf \
    -e MONGODB_INITIAL_PRIMARY_HOST=mongodb-server  \
    -e MONGODB_ADVERTISED_HOSTNAME=mongodb-server \
    -v mongodb-data:/bitnami/mongodb bitnami/mongodb:latest
```

### 创建一个 laf 应用

> 假设你的应用名为 `my`

为应用创建两个库：
- myapp-devops 存储应用开发数据（用于 `devops server`）
- myapp 存储应用数据（用于 `app server`）


```sh
# 进入数据库（先复制这条执行，进入库后再执行之后的）
docker exec -it mongodb-server mongo -u root -p $MONGODB_ROOT_PASSWORD

  # 创建 my-dev-db 库及用户（请修改其用户名密码）
  use myapp-devops;
  db.createUser({ user:"myapp-devops", pwd:"my_passwd", roles: [ { role: "readWrite", db: "myapp-devops" } ]});

  # 创建 my-app-db 库及用户（请修改其用户名密码）
  use myapp;
  db.createUser({ user:"myapp", pwd:"my_passwd", roles: [ { role: "readWrite", db: "myapp" } ]});

# 退出数据库
exit
```

#### 启动应用

> 1. 复制以下内容创建 `docker-compose.yml`

```yml
version: '3.8'
services: 
  devops_server:
    image: lessx/laf-devops-server:latest
    user: node
    environment: 
      SYS_DB: ${SYS_DB}
      SYS_DB_URI: ${SYS_DB_URI}?authSource=${SYS_DB}
      SYS_SERVER_SECRET_SALT: ${SYS_SERVER_SECRET_SALT}
      SYS_ADMIN: ${SYS_ADMIN}
      SYS_ADMIN_PASSWORD: ${SYS_ADMIN_PASSWORD}
      LOG_LEVEL: debug
      APP_DB: ${APP_DB}
      APP_DB_URI: ${APP_DB_URI}?authSource=${APP_DB}
      APP_SERVER_SECRET_SALT: ${APP_SERVER_SECRET_SALT}
    command: dockerize -wait tcp://mongodb-server:27017 npm run init-start
    ports:
      - "${SYS_EXPOSE_PORT}:9000"
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
      DB: ${APP_DB}
      DB_URI: ${APP_DB_URI}?authSource=${APP_DB}
      DB_POOL_LIMIT: 100
      SERVER_SECRET_SALT: ${APP_SERVER_SECRET_SALT}
      LOG_LEVEL: debug
      ENABLE_CLOUD_FUNCTION_LOG: always
    command: dockerize -wait http://devops_server:9000/health-check npm run init-start
    volumes:
      - app-data:/app/data
    ports:
      - "${APP_EXPOSE_PORT}:8000"
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
      - "${DEV_ADMIN_EXPOSE_PORT}:80"
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


> 2. 复制以下内容创建配置文件 `.env` （与 `docker-compose.yml` 同目录）

```sh
# config devops server 
SYS_DB=myapp-devops
SYS_DB_URI=mongodb://myapp-devops:my_passwd@mongodb-server:27017/
SYS_SERVER_SECRET_SALT=devops-server-abcdefg1234567
SYS_ADMIN=laf-sys
SYS_ADMIN_PASSWORD=laf-sys
SYS_EXPOSE_PORT=9000

# config app server
APP_DB=myapp
APP_DB_URI=mongodb://myapp:my_passwd@mongodb-server:27017/
APP_SERVER_SECRET_SALT=app-server-abcdefg1234567
APP_EXPOSE_PORT=8000

# config devops admin client
DEV_ADMIN_EXPOSE_PORT=8080
```

> 3. 在配置文件目录运行以下指令
启动服务，首次启动会自动拉取 laf 服务镜像，需要数分钟等待：

```sh
# 启动
docker-compose up

# 浏览器打开 http://locahost:8080 访问
```

### 附一：《应用管理指令》

```sh
# 以守护进程方式启动
docker-compose up -d

# 更新镜像
docker-compose pull

# 停止服务
docker-compose down

# 停止服务并清数据卷
docker-compose down -v
```

### 附一：《数据库备份、迁移》

```sh
# 备份数据库 `mydb`
docker exec mongodb-server sh -c \
  'exec mongodump --archive -u user -p user_passwd -d mydb' \
   > $(pwd)/$(date +%Y%m%d-%H%M%S)-mydb.archive

# 还原数据库至 `mydb`
docker exec -i mongodb-server sh -c \
  'exec mongorestore --archive -d mydb -u user -p user_passwd' \
  < $(pwd)/$(date +%Y%m%d-%H%M%S)-mydb.archive
```