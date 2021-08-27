# 创建一个 docker network，以供 mongo 与 其它 docker 服务网络互通
docker network create mongo-tier --driver bridge

# 设置 MongoDb root 用户密码（请修改为你的密码）
export MONGODB_ROOT_PASSWORD=SET_YOUR_ROOT_PASSWORD

# 启动 MongoDb 容器
docker run -d --name mongodb-server --network mongo-tier \
    -e MONGODB_ROOT_PASSWORD=$MONGODB_ROOT_PASSWORD \
    -e MONGODB_REPLICA_SET_MODE=primary \
    -e MONGODB_REPLICA_SET_KEY=replicasetkey123 \
    -e MONGODB_ENABLE_DIRECTORY_PER_DB=yes -e MONGODB_REPLICA_SET_NAME=rs0 \
    -e MONGODB_INITIAL_PRIMARY_HOST=mongodb-server  \
    -e MONGODB_ADVERTISED_HOSTNAME=mongodb-server \
    -v mongodb-data:/bitnami/mongodb bitnami/mongodb:latest